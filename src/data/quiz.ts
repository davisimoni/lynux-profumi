import type { LucideIcon } from "lucide-react";
import { Sun, Flower2, Wind, Snowflake, Moon, Feather, Flame, Sparkles, TreePine, Gem, Coffee } from "lucide-react";
import type { OlfactoryFamily } from "@/types/product";

export interface QuizOption {
  label: string;
  icon: LucideIcon;
  scores: Partial<Record<OlfactoryFamily, number>>;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Qual è la tua stagione preferita?",
    options: [
      { label: "Estate", icon: Sun, scores: { Agrumati: 2, Speziati: 1 } },
      { label: "Primavera", icon: Flower2, scores: { Speziati: 2, Agrumati: 1 } },
      { label: "Autunno", icon: Wind, scores: { Legnosi: 2, Ambrati: 1 } },
      { label: "Inverno", icon: Snowflake, scores: { Orientali: 2, Ambrati: 2 } },
    ],
  },
  {
    question: "Che atmosfera desideri evocare?",
    options: [
      { label: "Energica e Luminosa", icon: Sun, scores: { Agrumati: 2 } },
      { label: "Sensuale e Misteriosa", icon: Moon, scores: { Orientali: 2 } },
      { label: "Elegante e Raffinata", icon: Feather, scores: { Legnosi: 2 } },
      { label: "Calda e Avvolgente", icon: Flame, scores: { Ambrati: 2 } },
      { label: "Audace e Speziata", icon: Sparkles, scores: { Speziati: 2 } },
    ],
  },
  {
    question: "Quali materie prime ti attraggono di più?",
    options: [
      { label: "Agrumi & Note Verdi", icon: Sun, scores: { Agrumati: 2 } },
      { label: "Fiori & Spezie Rosa", icon: Flower2, scores: { Speziati: 2 } },
      { label: "Legni Preziosi", icon: TreePine, scores: { Legnosi: 2 } },
      { label: "Oud, Ambra & Resine", icon: Gem, scores: { Orientali: 2 } },
      { label: "Vaniglia & Tabacco", icon: Coffee, scores: { Ambrati: 2 } },
    ],
  },
];

export const FAMILY_TRAITS: Record<OlfactoryFamily, string> = {
  Legnosi: "Eleganza discreta, calore secco, radicamento silenzioso.",
  Speziati: "Carattere deciso, energia vibrante, un tocco di audacia.",
  Orientali: "Sensualità avvolgente, mistero, profondità magnetica.",
  Agrumati: "Luminosità, freschezza vitale, immediatezza solare.",
  Ambrati: "Calore vellutato, comfort, sensualità morbida.",
};
