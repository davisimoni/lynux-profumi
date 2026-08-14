"use client";

import { create } from "zustand";

export interface FlyToCartRequest {
  id: string;
  originX: number;
  originY: number;
  accent: string;
}

interface FlyToCartState {
  requests: FlyToCartRequest[];
  trigger: (origin: { x: number; y: number }, accent: string) => void;
  remove: (id: string) => void;
}

export const useFlyToCartStore = create<FlyToCartState>()((set) => ({
  requests: [],
  trigger: (origin, accent) =>
    set((state) => ({
      requests: [
        ...state.requests,
        { id: crypto.randomUUID(), originX: origin.x, originY: origin.y, accent },
      ],
    })),
  remove: (id) => set((state) => ({ requests: state.requests.filter((r) => r.id !== id) })),
}));
