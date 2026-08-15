import "server-only";
import { randomUUID } from "crypto";
import { products } from "@/data/products";
import { getOrdersRepository } from "@/lib/orders/repository";
import { unitsSoldByProduct } from "@/lib/orders/metrics";
import { telemetry } from "@/lib/telemetry";

/**
 * Inventory Reservation Engine.
 *
 * When a customer reaches checkout, the units in their cart are held for
 * RESERVATION_TTL_MS so a second shopper can't buy the last bottle out from
 * under them mid-checkout. A hold is released back into the pool either
 * explicitly (order placed, or the shopper leaves) or automatically once it
 * expires — nothing needs to be told to "give the stock back", any read
 * after expiry simply no longer counts it (see `sweepExpired`).
 *
 * This implementation is an in-memory fallback, the same "Fallback Mode"
 * pattern used for Stripe/Supabase elsewhere in this codebase: no database
 * is configured in this environment, so reservations live in a process-wide
 * Map instead of a `stock_reservations` table. Against a real Postgres
 * instance the unit of atomicity below (the mutex + validate-then-write
 * critical section) maps directly onto a single `SERIALIZABLE` transaction
 * or a conditional `UPDATE ... WHERE available >= quantity RETURNING *` —
 * the public API (`reserveStock` / `releaseReservation`) would not change.
 */

export const RESERVATION_TTL_MS = 10 * 60 * 1000;

export type ReservationStatus = "active" | "released" | "expired";

export interface ReservationLine {
  productId: string;
  sizeLabel: string;
  quantity: number;
}

export interface StockReservation {
  id: string;
  sessionKey: string;
  lines: ReservationLine[];
  createdAt: string;
  expiresAt: string;
  status: ReservationStatus;
}

export type ReserveResult =
  | { ok: true; reservation: StockReservation }
  | { ok: false; reason: "unknown_product" | "invalid_size"; productId: string }
  | { ok: false; reason: "insufficient_stock"; productId: string; available: number };

// --- Storage (in-memory fallback) -------------------------------------------

const globalForInventory = globalThis as unknown as {
  __lynuxReservations?: Map<string, StockReservation>;
  __lynuxInventorySweepStarted?: boolean;
};

function getStore(): Map<string, StockReservation> {
  if (!globalForInventory.__lynuxReservations) {
    globalForInventory.__lynuxReservations = new Map();
  }
  return globalForInventory.__lynuxReservations;
}

/** Flips any reservation past its TTL to "expired" — the actual mechanism by which held stock becomes available again. */
function sweepExpired(): void {
  const now = Date.now();
  for (const reservation of getStore().values()) {
    if (reservation.status === "active" && new Date(reservation.expiresAt).getTime() <= now) {
      reservation.status = "expired";
      telemetry.info("inventory.reservation_expired", "Prenotazione scaduta, stock ri-immesso", {
        reservationId: reservation.id,
        lines: reservation.lines,
      });
    }
  }
}

// A long-running dev/Node process also gets a periodic sweep so expired
// holds clear even without an incoming request — pure polish, since every
// read already sweeps lazily and that's what guarantees correctness
// (including in serverless, where a background interval never gets to run).
if (!globalForInventory.__lynuxInventorySweepStarted) {
  globalForInventory.__lynuxInventorySweepStarted = true;
  setInterval(sweepExpired, 30_000).unref();
}

// --- Mutex --------------------------------------------------------------
// JS's single-threadedness alone is NOT enough once the critical section
// contains an `await` (checking committed sales requires reading the
// orders repository) — two near-simultaneous requests could otherwise both
// pass validation before either writes its reservation. This promise-chain
// mutex serializes the whole validate-then-write section, which is the
// in-memory equivalent of the row lock a real database transaction gives
// you for free.

let mutexTail: Promise<unknown> = Promise.resolve();

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = mutexTail.then(task, task);
  mutexTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function activeReservedQuantity(productId: string, sizeLabel: string, excludeSessionKey: string): number {
  let total = 0;
  for (const reservation of getStore().values()) {
    if (reservation.status !== "active" || reservation.sessionKey === excludeSessionKey) continue;
    for (const line of reservation.lines) {
      if (line.productId === productId && line.sizeLabel === sizeLabel) total += line.quantity;
    }
  }
  return total;
}

/**
 * Validates and holds every line atomically: either the full cart is
 * reserved, or nothing is. Calling this again with the same `sessionKey`
 * releases that session's previous hold first, so refreshing the checkout
 * page extends the reservation instead of stacking duplicates.
 */
export async function reserveStock(sessionKey: string, lines: ReservationLine[]): Promise<ReserveResult> {
  return withLock(async () => {
    sweepExpired();

    const orders = await getOrdersRepository().list();
    const sold = unitsSoldByProduct(orders);

    for (const line of lines) {
      const product = products.find((candidate) => candidate.id === line.productId);
      if (!product) {
        return { ok: false, reason: "unknown_product", productId: line.productId };
      }
      if (!product.sizes.some((size) => size.label === line.sizeLabel)) {
        return { ok: false, reason: "invalid_size", productId: line.productId };
      }

      const alreadySold = sold.get(product.id) ?? 0;
      const reservedByOthers = activeReservedQuantity(line.productId, line.sizeLabel, sessionKey);
      const available = product.stockUnits - alreadySold - reservedByOthers;

      if (line.quantity > available) {
        telemetry.warn(
          "inventory.insufficient_stock",
          `Richiesti ${line.quantity} pezzi di ${product.name} (${line.sizeLabel}), disponibili ${Math.max(0, available)}`,
          { productId: line.productId, sizeLabel: line.sizeLabel, requested: line.quantity, available },
        );
        return { ok: false, reason: "insufficient_stock", productId: line.productId, available: Math.max(0, available) };
      }
    }

    for (const reservation of getStore().values()) {
      if (reservation.sessionKey === sessionKey && reservation.status === "active") {
        reservation.status = "released";
      }
    }

    const now = Date.now();
    const reservation: StockReservation = {
      id: randomUUID(),
      sessionKey,
      lines,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + RESERVATION_TTL_MS).toISOString(),
      status: "active",
    };
    getStore().set(reservation.id, reservation);

    telemetry.info("inventory.reserved", `Stock riservato per ${RESERVATION_TTL_MS / 60_000} minuti`, {
      reservationId: reservation.id,
      sessionKey,
      lines,
    });

    return { ok: true, reservation };
  });
}

export async function releaseReservation(reservationId: string): Promise<void> {
  return withLock(async () => {
    sweepExpired();
    const reservation = getStore().get(reservationId);
    if (reservation && reservation.status === "active") {
      reservation.status = "released";
      telemetry.info("inventory.released", "Prenotazione rilasciata", { reservationId });
    }
  });
}

export function getReservationSnapshot(reservationId: string): StockReservation | null {
  sweepExpired();
  return getStore().get(reservationId) ?? null;
}
