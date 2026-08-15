"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { QUIZ_STRUCTURE, type QuizOptionMeta } from "@/data/quiz";
import { products } from "@/data/products";
import type { OlfactoryFamily } from "@/types/product";
import { ProductArt } from "@/components/product/ProductArt";
import { useCartStore } from "@/store/cart";
import { useMoney } from "@/hooks/use-money";
import { useTranslation } from "@/hooks/use-translation";
import { localizeProduct } from "@/lib/i18n/localize-product";

const ZERO_SCORES: Record<OlfactoryFamily, number> = {
  Legnosi: 0,
  Speziati: 0,
  Orientali: 0,
  Agrumati: 0,
  Ambrati: 0,
};

export function QuizFlow() {
  const { locale, t } = useTranslation();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<OlfactoryFamily, number>>(ZERO_SCORES);
  const addItem = useCartStore((state) => state.addItem);
  const money = useMoney();

  const isResult = step >= QUIZ_STRUCTURE.length;

  function handleAnswer(option: QuizOptionMeta) {
    setScores((prev) => {
      const next = { ...prev };
      for (const [family, points] of Object.entries(option.scores)) {
        next[family as OlfactoryFamily] += points ?? 0;
      }
      return next;
    });
    setStep((s) => s + 1);
  }

  function handleReset() {
    setStep(0);
    setScores(ZERO_SCORES);
  }

  const result = useMemo(() => {
    if (!isResult) return null;
    const topFamily = (Object.keys(scores) as OlfactoryFamily[]).sort(
      (a, b) => scores[b] - scores[a],
    )[0];
    const candidates = products
      .filter((product) => product.family === topFamily)
      .sort((a, b) => Number(b.bestseller) - Number(a.bestseller) || b.popularity - a.popularity);
    return { family: topFamily, product: candidates[0] };
  }, [isResult, scores]);

  if (isResult && result) {
    const { family, product: rawProduct } = result;
    const product = localizeProduct(rawProduct, locale);
    const defaultSize = product.sizes[1] ?? product.sizes[0];

    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-luxe text-gold">{t.quiz.resultEyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
          {t.quiz.resultTitle(t.families[family].toLowerCase())}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          {t.quiz.familyTraits[family]}
        </p>

        <div className="mx-auto mt-10 max-w-sm overflow-hidden rounded-md border border-gold/40 bg-card text-left">
          <div className="aspect-square bg-obsidian">
            <ProductArt accent={product.accent} accentSoft={product.accentSoft} variant="bottle" />
          </div>
          <div className="space-y-3 p-6">
            <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">
              {t.families[product.family]} · {t.concentrations[product.concentration]}
            </p>
            <h2 className="font-display text-2xl text-cream">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.tagline}</p>
            <p className="font-display text-lg text-gold">{money(defaultSize.price)}</p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                href={`/product/${product.slug}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-gold py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90"
              >
                {t.quiz.discoverCta(product.name)}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  addItem({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    family: product.family,
                    sizeLabel: defaultSize.label,
                    sizeMl: defaultSize.ml,
                    unitPrice: defaultSize.price,
                    accent: product.accent,
                  });
                  toast.success(t.quiz.addedToast(product.name), {
                    description: defaultSize.label,
                  });
                }}
                className="flex-1 rounded-sm border border-border py-3 text-xs uppercase tracking-wide text-cream transition-colors hover:border-gold hover:text-gold cursor-pointer"
              >
                {t.quiz.addToCart}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="mx-auto mt-8 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground hover:text-gold cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t.quiz.retake}
        </button>
      </div>
    );
  }

  const questionMeta = QUIZ_STRUCTURE[step];
  const questionText = t.quiz.questions[step];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-center gap-2">
        {QUIZ_STRUCTURE.map((_, index) => (
          <div
            key={index}
            className={`h-1 w-10 rounded-full transition-colors ${
              index <= step ? "bg-gold" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      <p className="text-center text-xs uppercase tracking-luxe text-gold">
        {t.quiz.questionCounter(step + 1, QUIZ_STRUCTURE.length)}
      </p>
      <h1 className="mt-3 text-center font-display text-3xl font-semibold text-cream sm:text-4xl">
        {questionText.question}
      </h1>

      <div
        key={step}
        className="animate-fade-up mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {questionMeta.options.map((option, index) => {
          const Icon = option.icon;
          const label = questionText.options[index];
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleAnswer(option)}
              className="flex items-center gap-4 rounded-sm border border-border px-5 py-4 text-left transition-colors hover:border-gold hover:bg-gold/5 cursor-pointer"
            >
              <Icon className="h-5 w-5 shrink-0 text-gold" />
              <span className="text-sm text-cream">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
