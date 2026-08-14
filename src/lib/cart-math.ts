import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST, VAT_RATE } from "@/lib/constants";

/**
 * Isomorphic cart math — imported by both client components (via
 * store/cart.ts, which re-exports everything here) and server code
 * (checkout pricing, orders repository). Kept free of "use client" and any
 * store wiring so Route Handlers can call these functions directly instead
 * of importing a client-marked module.
 */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  family: string;
  sizeLabel: string;
  sizeMl: number;
  unitPrice: number;
  quantity: number;
  accent: string;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartShipping(subtotal: number): number {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

export function cartVatIncluded(subtotal: number): number {
  return subtotal - subtotal / (1 + VAT_RATE);
}

export function cartTotal(subtotal: number, shipping: number): number {
  return subtotal + shipping;
}
