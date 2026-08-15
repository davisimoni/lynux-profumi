"use client";

import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  link?: { href: string; label: string };
}

interface AssistantState {
  isOpen: boolean;
  messages: ChatMessage[];
  sending: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  addMessage: (message: ChatMessage) => void;
  setSending: (sending: boolean) => void;
}

export const useAssistantStore = create<AssistantState>()((set) => ({
  isOpen: false,
  messages: [],
  sending: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setSending: (sending) => set({ sending }),
}));
