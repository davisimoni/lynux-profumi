"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/cart-math";

export type { CartItem };
export { cartSubtotal, cartItemCount, cartShipping, cartVatIncluded, cartTotal } from "@/lib/cart-math";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, sizeLabel: string) => void;
  updateQuantity: (productId: string, sizeLabel: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.sizeLabel === item.sizeLabel,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.sizeLabel === item.sizeLabel
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity }],
            isOpen: true,
          };
        }),
      removeItem: (productId, sizeLabel) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.sizeLabel === sizeLabel),
          ),
        })),
      updateQuantity: (productId, sizeLabel, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId && i.sizeLabel === sizeLabel
                ? { ...i, quantity: Math.max(1, quantity) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "lynux-cart",
      // Only the cart contents should survive a reload — `isOpen` is
      // transient UI state. Without this, persisting `isOpen: true` (set
      // the moment an item is added) means the drawer snaps back open on
      // every subsequent full page load, blocking clicks on whatever page
      // the customer navigated to. Caught by the checkout.spec.ts E2E test.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
