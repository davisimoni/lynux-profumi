import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { isStripeWebhookConfigured, stripeWebhookSecret } from "@/lib/env";
import { getOrdersRepository } from "@/lib/orders/repository";
import { telemetry } from "@/lib/telemetry";

function extractOrderNumber(event: Stripe.Event): string | null {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      return intent.metadata?.orderNumber ?? null;
    }
    // Handled for completeness: our checkout embeds a PaymentElement backed
    // by a PaymentIntent (so payment_intent.succeeded is what actually
    // fires), but a hosted/embedded Checkout Session flow would raise this
    // event instead — same metadata contract, same handling.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      return session.metadata?.orderNumber ?? null;
    }
    default:
      return null;
  }
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe || !isStripeWebhookConfigured) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
  } catch (error) {
    telemetry.error("stripe.webhook_invalid_signature", "Firma webhook Stripe non valida", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  telemetry.info("stripe.webhook_received", `Evento Stripe ricevuto: ${event.type}`, {
    eventId: event.id,
    eventType: event.type,
  });

  const orderNumber = extractOrderNumber(event);
  if (orderNumber) {
    const repository = getOrdersRepository();
    const order = await repository.getByOrderNumber(orderNumber);
    // Idempotent: a retried webhook delivery should not re-advance an order
    // that a previous delivery already confirmed.
    if (order && order.status === "received") {
      await repository.updateStatus(orderNumber, "preparing");
      telemetry.info("stripe.webhook_order_advanced", `Ordine ${orderNumber} confermato via webhook`, {
        orderNumber,
        eventType: event.type,
      });
    }
  }

  return NextResponse.json({ received: true });
}
