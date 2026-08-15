"use client";

import { useTranslation } from "@/hooks/use-translation";

export function BrandStory() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-border bg-obsidian">
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-luxe text-gold">{t.brandStory.eyebrow}</p>
        <p className="mt-8 font-display text-2xl font-semibold leading-relaxed text-cream sm:text-3xl">
          {t.brandStory.textBefore}
          <span className="text-gold-gradient">{t.brandStory.emphasis}</span>
          {t.brandStory.textAfter}
        </p>
        <div className="mx-auto mt-10 h-px w-16 bg-gold" />
        <p className="mt-10 text-sm text-muted-foreground">{t.brandStory.footer}</p>
      </div>
    </section>
  );
}
