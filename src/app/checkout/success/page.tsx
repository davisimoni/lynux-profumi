import type { Metadata } from "next";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";

export const metadata: Metadata = {
  title: "Ordine Confermato | Lynux Profumi",
  description: "Il tuo ordine Lynux Profumi è stato confermato.",
};

export default function CheckoutSuccessPage() {
  return <OrderSuccess />;
}
