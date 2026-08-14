import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/client";
import { buildSeedOrders } from "@/data/orders-seed";
import type { OrderStatus, PersistedOrder } from "@/lib/orders/types";

export interface OrdersRepository {
  create(order: PersistedOrder): Promise<void>;
  getByOrderNumber(orderNumber: string): Promise<PersistedOrder | null>;
  updateStatus(orderNumber: string, status: OrderStatus): Promise<PersistedOrder | null>;
  list(limit?: number): Promise<PersistedOrder[]>;
}

// --- Supabase-backed implementation -----------------------------------------

interface OrderRow {
  order_number: string;
  status: OrderStatus;
  currency: PersistedOrder["currency"];
  subtotal: number;
  shipping: number;
  total: number;
  items: PersistedOrder["items"];
  shipping_address: PersistedOrder["shippingAddress"];
  payment_method: PersistedOrder["paymentMethod"];
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: OrderRow): PersistedOrder {
  return {
    orderNumber: row.order_number,
    status: row.status,
    currency: row.currency,
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    items: row.items,
    shippingAddress: row.shipping_address,
    paymentMethod: row.payment_method,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(order: PersistedOrder): OrderRow {
  return {
    order_number: order.orderNumber,
    status: order.status,
    currency: order.currency,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    items: order.items,
    shipping_address: order.shippingAddress,
    payment_method: order.paymentMethod,
    stripe_payment_intent_id: order.stripePaymentIntentId,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

class SupabaseOrdersRepository implements OrdersRepository {
  async create(order: PersistedOrder): Promise<void> {
    const client = getSupabaseAdminClient();
    if (!client) return;
    await client.from("orders").insert(toRow(order));
  }

  async getByOrderNumber(orderNumber: string): Promise<PersistedOrder | null> {
    const client = getSupabaseAdminClient();
    if (!client) return null;
    const { data } = await client
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();
    return data ? fromRow(data as OrderRow) : null;
  }

  async updateStatus(orderNumber: string, status: OrderStatus): Promise<PersistedOrder | null> {
    const client = getSupabaseAdminClient();
    if (!client) return null;
    const { data } = await client
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("order_number", orderNumber)
      .select("*")
      .maybeSingle();
    return data ? fromRow(data as OrderRow) : null;
  }

  async list(limit = 100): Promise<PersistedOrder[]> {
    const client = getSupabaseAdminClient();
    if (!client) return [];
    const { data } = await client
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((row) => fromRow(row as OrderRow));
  }
}

// --- In-memory fallback (no backend configured) -----------------------------
// Persists only for the lifetime of this server process — fine for local
// dev and for demoing the full request/response cycle, but a fresh
// serverless instance on Vercel starts empty again. Seeded once with
// realistic historical orders so the admin dashboard and order lookups
// never look empty in fallback mode.

const globalForOrders = globalThis as unknown as {
  __lynuxOrders?: Map<string, PersistedOrder>;
};

function getStore(): Map<string, PersistedOrder> {
  if (!globalForOrders.__lynuxOrders) {
    const store = new Map<string, PersistedOrder>();
    for (const order of buildSeedOrders()) {
      store.set(order.orderNumber, order);
    }
    globalForOrders.__lynuxOrders = store;
  }
  return globalForOrders.__lynuxOrders;
}

class InMemoryOrdersRepository implements OrdersRepository {
  async create(order: PersistedOrder): Promise<void> {
    getStore().set(order.orderNumber, order);
  }

  async getByOrderNumber(orderNumber: string): Promise<PersistedOrder | null> {
    return getStore().get(orderNumber) ?? null;
  }

  async updateStatus(orderNumber: string, status: OrderStatus): Promise<PersistedOrder | null> {
    const existing = getStore().get(orderNumber);
    if (!existing) return null;
    const updated: PersistedOrder = { ...existing, status, updatedAt: new Date().toISOString() };
    getStore().set(orderNumber, updated);
    return updated;
  }

  async list(limit = 100): Promise<PersistedOrder[]> {
    return Array.from(getStore().values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}

let repository: OrdersRepository | null = null;

export function getOrdersRepository(): OrdersRepository {
  if (!repository) {
    repository = isSupabaseConfigured ? new SupabaseOrdersRepository() : new InMemoryOrdersRepository();
  }
  return repository;
}
