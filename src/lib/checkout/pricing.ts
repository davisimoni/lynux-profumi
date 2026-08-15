import { z } from "zod";
import { products } from "@/data/products";
import { cartShipping, cartSubtotal, cartVatIncluded, type CartItem } from "@/lib/cart-math";

const DUO_SET_SUFFIX = " · Duo Set";
const DUO_DISCOUNT = 0.1;

export const DISCOVERY_SET_SUFFIX = " · Discovery Set";
export const DISCOVERY_SET_SAMPLE_COUNT = 5;
export const DISCOVERY_SET_TOTAL_PRICE = 60;
export const DISCOVERY_SET_UNIT_PRICE = Math.round(
  DISCOVERY_SET_TOTAL_PRICE / DISCOVERY_SET_SAMPLE_COUNT,
);

export const ENGRAVING_MARKER = " · Incisione: ";
export const ENGRAVING_PRICE = 15;
export const ENGRAVING_MAX_LENGTH = 12;

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  family: z.string().min(1),
  sizeLabel: z.string().min(1),
  sizeMl: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive().max(20),
  accent: z.string().min(1),
});

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  province: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  phone: z.string().min(1).max(40),
  email: z.string().email(),
});

const checkoutBaseSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
  paymentMethod: z.enum(["card", "apple-pay", "paypal"]),
  currency: z.enum(["EUR", "USD", "GBP"]),
});

/**
 * Used by POST /api/checkout. Address is optional here: for the Stripe/card
 * path the PaymentIntent is created as soon as the payment step is reached,
 * before the shipping form is necessarily filled in — the address is only
 * required once an order is actually about to be persisted (the demo path,
 * or /api/checkout/confirm below).
 */
export const checkoutCreateSchema = checkoutBaseSchema.extend({
  shippingAddress: shippingAddressSchema.optional(),
});

/** Used by the demo path and POST /api/checkout/confirm: address required. */
export const checkoutRequestSchema = checkoutBaseSchema.extend({
  shippingAddress: shippingAddressSchema,
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export interface PriceIntegrityIssue {
  productId: string;
  sizeLabel: string;
  claimedPrice: number;
  trustedPrice: number;
}

export interface TrustedCartResult {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  vatIncluded: number;
  total: number;
  issues: PriceIntegrityIssue[];
}

/**
 * Recomputes the canonical EUR unit price for a cart line from the product
 * catalogue instead of trusting the client-supplied value — a client could
 * otherwise post an arbitrary `unitPrice` and check out for free. Handles
 * three line "shapes", stacked as suffixes on the plain size label:
 *  - "{size}"                                — a normal purchase
 *  - "{size} · Duo Set"                       — 10% off, from the Layering Lab
 *  - "{size} · Incisione: {TEXT}"             — +€15 engraving surcharge
 *  - "{10ml} · Discovery Set"                 — flat per-sample bundle price
 */
function resolveTrustedUnitPrice(productId: string, sizeLabel: string): number | null {
  const product = products.find((candidate) => candidate.id === productId);
  if (!product) return null;

  if (sizeLabel.endsWith(DISCOVERY_SET_SUFFIX)) {
    const baseLabel = sizeLabel.slice(0, -DISCOVERY_SET_SUFFIX.length);
    const isValidSample = product.sizes.some((size) => size.label === baseLabel && size.ml === 10);
    return isValidSample ? DISCOVERY_SET_UNIT_PRICE : null;
  }

  let workingLabel = sizeLabel;
  let surcharge = 0;

  const engravingIndex = workingLabel.indexOf(ENGRAVING_MARKER);
  if (engravingIndex !== -1) {
    workingLabel = workingLabel.slice(0, engravingIndex);
    surcharge += ENGRAVING_PRICE;
  }

  const isDuoSet = workingLabel.endsWith(DUO_SET_SUFFIX);
  const baseLabel = isDuoSet ? workingLabel.slice(0, -DUO_SET_SUFFIX.length) : workingLabel;
  const size = product.sizes.find((candidate) => candidate.label === baseLabel);
  if (!size) return null;

  const basePrice = isDuoSet ? Math.round(size.price * (1 - DUO_DISCOUNT)) : size.price;
  return basePrice + surcharge;
}

/**
 * Validates every line against the product catalogue and rebuilds totals
 * from trusted prices. `issues` lists any line where the client's price
 * disagreed with the catalogue — the trusted price always wins.
 */
export function buildTrustedCart(items: CartItem[]): TrustedCartResult {
  const issues: PriceIntegrityIssue[] = [];

  const trustedItems: CartItem[] = [];
  for (const item of items) {
    const trustedPrice = resolveTrustedUnitPrice(item.productId, item.sizeLabel);
    if (trustedPrice === null) continue;

    if (trustedPrice !== item.unitPrice) {
      issues.push({
        productId: item.productId,
        sizeLabel: item.sizeLabel,
        claimedPrice: item.unitPrice,
        trustedPrice,
      });
    }

    trustedItems.push({ ...item, unitPrice: trustedPrice });
  }

  const subtotal = cartSubtotal(trustedItems);
  const shipping = cartShipping(subtotal);
  const vatIncluded = cartVatIncluded(subtotal);
  const total = subtotal + shipping;

  return { items: trustedItems, subtotal, shipping, vatIncluded, total, issues };
}
