"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "it" | "en";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "it",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "lynux-locale" },
  ),
);
