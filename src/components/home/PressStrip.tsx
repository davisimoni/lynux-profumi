"use client";

import { useTranslation } from "@/hooks/use-translation";

export function PressStrip() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-border bg-obsidian-raised">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="mb-10 text-center text-[11px] uppercase tracking-luxe text-muted-foreground">
          {t.pressStrip.eyebrow}
        </p>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.pressStrip.quotes.map(({ quote, source }) => (
            <figure key={source} className="text-center">
              <blockquote className="font-display text-lg font-semibold leading-snug text-cream sm:text-xl">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-[11px] uppercase tracking-luxe text-gold">
                {source}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
