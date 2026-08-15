import { NextResponse } from "next/server";
import { checkoutCreateSchema, shippingAddressSchema, buildTrustedCart } from "@/lib/checkout/pricing";
import { getStripeClient } from "@/lib/stripe/client";
import { isStripeConfigured } from "@/lib/env";
import { generateSignedOrderNumber } from "@/lib/order-security";
import { getOrdersRepository } from "@/lib/orders/repository";
import { convertFromEur } from "@/lib/currency";
import { telemetry } from "@/lib/telemetry";

export async function POST(request: Request) {
  const parsed = checkoutCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    telemetry.warn("checkout.invalid_request", "Payload di checkout non valido", {
      issues: parsed.error?.issues,
    });
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { items, shippingAddress, paymentMethod, currency } = parsed.data;
  const trustedCart = buildTrustedCart(items);

  if (trustedCart.items.length === 0) {
    telemetry.warn("checkout.empty_cart", "Tentativo di checkout con carrello vuoto");
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  if (trustedCart.issues.length > 0) {
    telemetry.warn("checkout.price_integrity_mismatch", "Prezzo client discordante dal catalogo", {
      issues: trustedCart.issues,
    });
  }

  const orderNumber = generateSignedOrderNumber();
  const stripe = getStripeClient();

  // Only "card" goes through real Stripe (PaymentIntent + Elements). Apple
  // Pay / PayPal remain simulated regardless of Stripe configuration — wiring
  // their real payment sheets is a distinct integration outside this scope.
  if (!isStripeConfigured || !stripe || paymentMethod !== "card") {
    const address = shippingAddressSchema.safeParse(shippingAddress);
    if (!address.success) {
      return NextResponse.json({ error: "missing_shipping_address" }, { status: 400 });
    }

    // No payment gateway to wait on: the demo order is complete the instant
    // it's created, so it's safe to persist right away.
    const now = new Date().toISOString();
    await getOrdersRepository().create({
      orderNumber,
      status: "received",
      currency,
      subtotal: trustedCart.subtotal,
      shipping: trustedCart.shipping,
      total: trustedCart.total,
      items: trustedCart.items,
      shippingAddress: address.data,
      paymentMethod,
      stripePaymentIntentId: null,
      createdAt: now,
      updatedAt: now,
    });

    telemetry.info("checkout.demo_order_created", `Ordine demo ${orderNumber} creato`, {
      orderNumber,
      total: trustedCart.total,
      currency,
      itemCount: trustedCart.items.length,
    });

    return NextResponse.json({
      mode: "demo" as const,
      orderNumber,
      subtotal: trustedCart.subtotal,
      shipping: trustedCart.shipping,
      total: trustedCart.total,
      priceIntegrityIssues: trustedCart.issues,
    });
  }

  // Stripe expects the smallest currency unit (cents) for a zero-decimal-free
  // currency like EUR/USD/GBP, converted from our canonical EUR total.
  const amountInMinorUnits = Math.max(
    50,
    Math.round(convertFromEur(trustedCart.total, currency) * 100),
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInMinorUnits,
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    receipt_email: shippingAddress?.email,
    metadata: { orderNumber },
  });

  // Deliberately not persisted yet: a PaymentIntent is created as soon as the
  // customer reaches the payment step, before they've entered a card — most
  // never complete. Writing the order now would fill the orders table (and
  // the admin revenue dashboard) with abandoned-cart noise. The order is
  // only saved by /api/checkout/confirm once Stripe confirms the payment
  // actually succeeded, with the webhook as a second, idempotent backstop.

  telemetry.info("checkout.stripe_intent_created", `PaymentIntent creato per l'ordine ${orderNumber}`, {
    orderNumber,
    paymentIntentId: paymentIntent.id,
    amountInMinorUnits,
    currency,
  });

  return NextResponse.json({
    mode: "stripe" as const,
    orderNumber,
    clientSecret: paymentIntent.client_secret,
    subtotal: trustedCart.subtotal,
    shipping: trustedCart.shipping,
    total: trustedCart.total,
    priceIntegrityIssues: trustedCart.issues,
  });
}
