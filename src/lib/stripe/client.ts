import "server-only";
import Stripe from "stripe";
import { isStripeConfigured, stripeSecretKey } from "@/lib/env";

const globalForStripe = globalThis as unknown as { __lynuxStripe?: Stripe };

export function getStripeClient(): Stripe | null {
  if (!isStripeConfigured) return null;

  if (!globalForStripe.__lynuxStripe) {
    globalForStripe.__lynuxStripe = new Stripe(stripeSecretKey);
  }

  return globalForStripe.__lynuxStripe;
}
