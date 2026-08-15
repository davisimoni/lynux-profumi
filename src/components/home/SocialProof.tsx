"use client";

import { Leaf, Gem, Gift, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

const ICONS = [Leaf, Gem, Gift, ShieldCheck];

export function SocialProof() {
  const { t } = useTranslation();

  return (
    <section className="bg-obsidian-raised">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {t.socialProof.commitments.map(({ title, description }, index) => {
            const Icon = ICONS[index];
            return (
              <div key={title} className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-display text-base text-cream">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
