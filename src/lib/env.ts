import "server-only";

/**
 * Central availability flags for optional backend integrations. Every
 * feature that touches Stripe or Supabase must branch on these instead of
 * probing `process.env` directly, so "is it configured" is answered in
 * exactly one place and the fallback path is always a deliberate choice,
 * never an accident of a missing key surfacing as a crash.
 */

export const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export const isStripeConfigured = Boolean(stripeSecretKey && stripePublishableKey);
export const isStripeWebhookConfigured = Boolean(stripeWebhookSecret);

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

export const orderHmacSecret = process.env.ORDER_HMAC_SECRET ?? "lynux-portfolio-demo-insecure-secret";

/**
 * Optional shared secret gating /admin and its API routes. Unset by default
 * (as in this portfolio build), which keeps the demo dashboard reachable
 * with the single "Accedi alla Dashboard Demo" click the brief asks for.
 * Setting it turns that click into a real passphrase gate.
 */
export const adminAccessCode = process.env.ADMIN_ACCESS_CODE ?? "";
export const isAdminGateConfigured = Boolean(adminAccessCode);
