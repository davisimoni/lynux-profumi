"use client";

const STORAGE_KEY = "lynux-session-key";

/**
 * Stable per-browser identifier, persisted in localStorage. Used to tie an
 * inventory reservation to "whoever is checking out on this device" so
 * refreshing the checkout page extends the same hold instead of stacking a
 * new one, without requiring a real auth session.
 */
export function getOrCreateSessionKey(): string {
  if (typeof window === "undefined") return "server";

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, created);
  return created;
}
