import type { Metadata } from "next";
import { QuizFlow } from "@/components/scent-finder/QuizFlow";

export const metadata: Metadata = {
  title: "Scent Finder | Lynux Profumi",
  description:
    "Rispondi a tre domande e scopri la fragranza Lynux Profumi pensata per il tuo carattere olfattivo.",
};

export default function ScentFinderPage() {
  return <QuizFlow />;
}
