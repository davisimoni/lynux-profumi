import { NextResponse } from "next/server";
import { z } from "zod";
import { checkoutRequestSchema, buildTrustedCart } from "@/lib/checkout/pricing";
import { getStripeClient } from "@/lib/stripe/client";
import { isStripeConfigured } from "@/lib/env";
import { isValidSignedOrderNumber } from "@/lib/order-security";
import { getOrdersRepository } from "@/lib/orders/repository";

const confirmRequestSchema = checkoutRequestSchema.extend({
  orderNumber: z.string().min(1),
  paymentIntentId: z.string().min(1),
});

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!isStripeConfigured || !stripe) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const parsed = confirmRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { items, shippingAddress, paymentMethod, currency, orderNumber, paymentIntentId } =
    parsed.data;

  if (!isValidSignedOrderNumber(orderNumber)) {
    return NextResponse.json({ error: "invalid_order_number" }, { status: 400 });
  }

  // Authoritative check: trust Stripe's own record of the PaymentIntent, not
  // the client's say-so, and make sure it's the intent we issued for this
  // exact order number before ever writing anything to storage.
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (
    paymentIntent.status !== "succeeded" ||
    paymentIntent.metadata?.orderNumber !== orderNumber
  ) {
    return NextResponse.json({ error: "payment_not_confirmed" }, { status: 402 });
  }

  const repository = getOrdersRepository();
  const existing = await repository.getByOrderNumber(orderNumber);
  if (existing) {
    return NextResponse.json({ order: existing });
  }

  const trustedCart = buildTrustedCart(items);
  const now = new Date().toISOString();

  await repository.create({
    orderNumber,
    status: "received",
    currency,
    subtotal: trustedCart.subtotal,
    shipping: trustedCart.shipping,
    total: trustedCart.total,
    items: trustedCart.items,
    shippingAddress,
    paymentMethod,
    stripePaymentIntentId: paymentIntent.id,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    orderNumber,
    subtotal: trustedCart.subtotal,
    shipping: trustedCart.shipping,
    total: trustedCart.total,
  });
}
