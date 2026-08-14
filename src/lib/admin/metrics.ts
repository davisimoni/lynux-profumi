import { products } from "@/data/products";
import type { PersistedOrder } from "@/lib/orders/types";

export interface InventoryRow {
  productId: string;
  name: string;
  stockUnits: number;
  unitsSold: number;
  remaining: number;
  lowStock: boolean;
}

export interface AdminMetrics {
  totalRevenueEur: number;
  orderCount: number;
  bestSeller: { name: string; unitsSold: number } | null;
  inventory: InventoryRow[];
}

const LOW_STOCK_THRESHOLD = 20;

export function computeAdminMetrics(orders: PersistedOrder[]): AdminMetrics {
  const totalRevenueEur = orders.reduce((sum, order) => sum + order.total, 0);

  const unitsSoldByProduct = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      unitsSoldByProduct.set(
        item.productId,
        (unitsSoldByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }
  }

  const inventory: InventoryRow[] = products.map((product) => {
    const unitsSold = unitsSoldByProduct.get(product.id) ?? 0;
    const remaining = Math.max(0, product.stockUnits - unitsSold);
    return {
      productId: product.id,
      name: product.name,
      stockUnits: product.stockUnits,
      unitsSold,
      remaining,
      lowStock: remaining < LOW_STOCK_THRESHOLD,
    };
  });

  let bestSeller: AdminMetrics["bestSeller"] = null;
  for (const row of inventory) {
    if (row.unitsSold > 0 && (!bestSeller || row.unitsSold > bestSeller.unitsSold)) {
      bestSeller = { name: row.name, unitsSold: row.unitsSold };
    }
  }

  return { totalRevenueEur, orderCount: orders.length, bestSeller, inventory };
}
