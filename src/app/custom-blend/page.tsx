import type { Metadata } from "next";
import { BlendLab } from "@/components/blend/BlendLab";

export const metadata: Metadata = {
  title: "Layering Lab | Lynux Profumi",
  description:
    "Combina due fragranze Lynux Profumi, scopri il loro Scent Harmony Score e crea un Duo Set con piramide olfattiva combinata.",
};

export default function CustomBlendPage() {
  return <BlendLab />;
}
