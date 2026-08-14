import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/track-order/TrackOrderClient";

export const metadata: Metadata = {
  title: "Traccia il tuo Ordine | Lynux Profumi",
  description:
    "Inserisci il codice del tuo ordine Lynux Profumi e segui in tempo reale lo stato di preparazione e spedizione.",
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
