"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
      <p className="text-xs uppercase tracking-luxe text-gold">Errore 404</p>
      <h1 className="font-display text-4xl font-semibold text-cream">
        {t.system.notFoundTitle}
      </h1>
      <p className="text-sm text-muted-foreground">{t.system.notFoundDescription}</p>
      <Link
        href="/catalog"
        className="mt-4 rounded-sm border border-gold px-6 py-3 text-xs uppercase tracking-luxe text-gold transition-colors hover:bg-gold hover:text-obsidian"
      >
        {t.system.notFoundCta}
      </Link>
    </div>
  );
}
