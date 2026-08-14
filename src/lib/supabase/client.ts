import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

const globalForSupabase = globalThis as unknown as { __lynuxSupabase?: SupabaseClient };

/**
 * Service-role Supabase client for server-only use (Route Handlers, Server
 * Components). Returns null when Supabase isn't configured so every caller
 * is forced to handle the fallback path explicitly.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;

  if (!globalForSupabase.__lynuxSupabase) {
    globalForSupabase.__lynuxSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }

  return globalForSupabase.__lynuxSupabase;
}
