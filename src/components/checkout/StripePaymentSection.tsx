"use client";

import { useEffect } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Stripe, StripeElements } from "@stripe/stripe-js";
import { getStripeClientPromise } from "@/lib/stripe/browser";

export interface StripeApi {
  stripe: Stripe;
  elements: StripeElements;
}

interface StripeBridgeProps {
  onReady: (api: StripeApi) => void;
}

function StripeBridge({ onReady }: StripeBridgeProps) {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (stripe && elements) onReady({ stripe, elements });
  }, [stripe, elements, onReady]);

  return <PaymentElement />;
}

interface StripePaymentSectionProps {
  clientSecret: string;
  onReady: (api: StripeApi) => void;
}

export function StripePaymentSection({ clientSecret, onReady }: StripePaymentSectionProps) {
  const stripePromise = getStripeClientPromise();
  if (!stripePromise) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#D8B45B",
            colorBackground: "#121216",
            colorText: "#F5F5F2",
            colorDanger: "#B3402F",
            colorTextPlaceholder: "#94A3B8",
            fontFamily: "var(--font-body), sans-serif",
            borderRadius: "2px",
            spacingUnit: "4px",
          },
        },
      }}
    >
      <StripeBridge onReady={onReady} />
    </Elements>
  );
}
