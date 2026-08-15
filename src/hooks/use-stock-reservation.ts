"use client";

import { useEffect, useRef, useState } from "react";
import type { CartItem } from "@/store/cart";
import { getOrCreateSessionKey } from "@/lib/session-key";
import { telemetry } from "@/lib/telemetry";

export const RESERVATION_TTL_SECONDS = 10 * 60;

interface ReservationState {
  reservationId: string | null;
  expiresAt: number | null;
  remainingSeconds: number;
  expired: boolean;
  insufficientStock: { productId: string; available: number } | null;
  loading: boolean;
}

const INITIAL_STATE: ReservationState = {
  reservationId: null,
  expiresAt: null,
  remainingSeconds: RESERVATION_TTL_SECONDS,
  expired: false,
  insufficientStock: null,
  loading: false,
};

function linesFromItems(items: CartItem[]) {
  return items
    .map((item) => ({ productId: item.productId, sizeLabel: item.sizeLabel, quantity: item.quantity }))
    .sort((a, b) => (a.productId + a.sizeLabel).localeCompare(b.productId + b.sizeLabel));
}

function releaseBeacon(reservationId: string) {
  const payload = JSON.stringify({ reservationId });
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/inventory/release", new Blob([payload], { type: "application/json" }));
  } else {
    fetch("/api/inventory/release", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}

/**
 * Holds the current cart's stock for RESERVATION_TTL_SECONDS while the
 * shopper is on the checkout page, and drives the "Riservato per te" mini
 * countdown. Re-reserves (extending the same hold) whenever the cart
 * contents actually change; releases the hold on unmount/tab-close so the
 * stock frees up immediately rather than waiting out the full TTL.
 */
export function useStockReservation(items: CartItem[]) {
  const [state, setState] = useState<ReservationState>(INITIAL_STATE);
  const reservationIdRef = useRef<string | null>(null);
  const linesKey = JSON.stringify(linesFromItems(items));

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;
    const sessionKey = getOrCreateSessionKey();

    // `linesKey` is a deterministic serialization of `items`, so re-running
    // this effect exactly when it changes keeps `items` (read once below,
    // synchronously at effect-run time) correctly in sync — no stale value
    // can leak across renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, loading: true, insufficientStock: null }));

    fetch("/api/inventory/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionKey, lines: linesFromItems(items) }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          setState({
            ...INITIAL_STATE,
            insufficientStock:
              data.error === "insufficient_stock"
                ? { productId: data.productId, available: data.available }
                : null,
          });
          telemetry.warn("checkout.reservation_failed", "Prenotazione stock non riuscita", data);
          return;
        }

        reservationIdRef.current = data.reservation.id;
        setState({
          reservationId: data.reservation.id,
          expiresAt: new Date(data.reservation.expiresAt).getTime(),
          remainingSeconds: RESERVATION_TTL_SECONDS,
          expired: false,
          insufficientStock: null,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey]);

  useEffect(() => {
    const expiresAt = state.expiresAt;
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setState((prev) => ({ ...prev, remainingSeconds: remaining, expired: remaining === 0 }));
      if (remaining === 0) {
        telemetry.warn("checkout.reservation_expired_client", "Countdown di prenotazione esaurito", {
          reservationId: reservationIdRef.current,
        });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.expiresAt]);

  useEffect(() => {
    return () => {
      if (reservationIdRef.current) releaseBeacon(reservationIdRef.current);
    };
  }, []);

  function release() {
    if (!reservationIdRef.current) return;
    const id = reservationIdRef.current;
    reservationIdRef.current = null;
    fetch("/api/inventory/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: id }),
    }).catch(() => {});
  }

  return { ...state, release };
}
