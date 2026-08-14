import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Lynux Profumi",
  description: "Completa il tuo ordine Lynux Profumi.",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
