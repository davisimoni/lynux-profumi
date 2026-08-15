import type { PersistedOrder } from "@/lib/orders/types";

/** Committed (paid/placed) units per product across a set of orders. */
export function unitsSoldByProduct(orders: PersistedOrder[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity);
    }
  }
  return totals;
}
