import type { Metadata } from "next";
import { SampleDiscoveryClient } from "@/components/sample-discovery/SampleDiscoveryClient";

export const metadata: Metadata = {
  title: "Discovery Set | Lynux Profumi",
  description:
    "Componi il tuo Discovery Set da 5 campioni da 10ml a prezzo promozionale, con la promessa di un voucher di pari importo sull'acquisto di un formato 100ml.",
};

export default function SampleDiscoveryPage() {
  return <SampleDiscoveryClient />;
}
