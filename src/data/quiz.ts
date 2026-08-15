import type { LucideIcon } from "lucide-react";
import { Sun, Flower2, Wind, Snowflake, Moon, Feather, Flame, Sparkles, TreePine, Gem, Coffee } from "lucide-react";
import type { OlfactoryFamily } from "@/types/product";

export interface QuizOptionMeta {
  icon: LucideIcon;
  scores: Partial<Record<OlfactoryFamily, number>>;
}

export interface QuizQuestionMeta {
  options: QuizOptionMeta[];
}

/**
 * Structural quiz data only — icons and scoring weights. Question and
 * option text lives in the i18n dictionary (`t.quiz.questions`), indexed by
 * the same position, so QuizFlow zips the two together at render time.
 */
export const QUIZ_STRUCTURE: QuizQuestionMeta[] = [
  {
    options: [
      { icon: Sun, scores: { Agrumati: 2, Speziati: 1 } },
      { icon: Flower2, scores: { Speziati: 2, Agrumati: 1 } },
      { icon: Wind, scores: { Legnosi: 2, Ambrati: 1 } },
      { icon: Snowflake, scores: { Orientali: 2, Ambrati: 2 } },
    ],
  },
  {
    options: [
      { icon: Sun, scores: { Agrumati: 2 } },
      { icon: Moon, scores: { Orientali: 2 } },
      { icon: Feather, scores: { Legnosi: 2 } },
      { icon: Flame, scores: { Ambrati: 2 } },
      { icon: Sparkles, scores: { Speziati: 2 } },
    ],
  },
  {
    options: [
      { icon: Sun, scores: { Agrumati: 2 } },
      { icon: Flower2, scores: { Speziati: 2 } },
      { icon: TreePine, scores: { Legnosi: 2 } },
      { icon: Gem, scores: { Orientali: 2 } },
      { icon: Coffee, scores: { Ambrati: 2 } },
    ],
  },
];
