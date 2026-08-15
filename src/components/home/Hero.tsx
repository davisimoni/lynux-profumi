"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ProductArt } from "@/components/product/ProductArt";
import { useTranslation } from "@/hooks/use-translation";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="glow-amber pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <ProductArt accent="#D8B45B" accentSoft="#241a0c" variant="aura" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/80" />

      <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="animate-fade-up text-xs uppercase tracking-luxe text-gold">
          {t.hero.eyebrow}
        </p>
        <h1
          className="animate-fade-up mt-6 max-w-3xl text-balance font-display text-5xl font-bold leading-[1.1] tracking-tight text-cream sm:text-6xl md:text-7xl"
          style={{ animationDelay: "0.1s" }}
        >
          {t.hero.titlePrefix}{" "}
          <span className="text-gold-gradient">{t.hero.titleEmphasis}</span>.
        </h1>
        <p
          className="animate-fade-up mt-4 font-display text-lg font-semibold tracking-wide text-bronze sm:text-xl"
          style={{ animationDelay: "0.15s" }}
        >
          {t.hero.subheadline}
        </p>
        <p
          className="animate-fade-up mt-6 max-w-xl text-balance text-lg font-medium leading-relaxed text-foreground-secondary sm:text-xl"
          style={{ animationDelay: "0.2s" }}
        >
          {t.hero.subtitle}
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/catalog"
            className="group flex items-center gap-2 rounded-sm bg-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-luxe text-obsidian transition-all hover:opacity-90"
          >
            {t.hero.ctaPrimary}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/scent-finder"
            className="rounded-sm border border-border px-8 py-3.5 text-xs font-semibold uppercase tracking-luxe text-cream transition-colors hover:border-gold hover:text-gold"
          >
            {t.hero.ctaSecondary}
          </Link>
        </div>

        <div
          className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          style={{ animationDelay: "0.4s" }}
        >
          {t.hero.friction.map((reducer, index) => (
            <Fragment key={reducer}>
              {index > 0 && <span className="text-gold-soft/40">·</span>}
              <span className="flex items-center gap-1.5 text-sm tracking-wide text-[#CBD5E1]">
                {index === 0 && <ShieldCheck className="h-3.5 w-3.5 text-gold-soft" />}
                {reducer}
              </span>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
