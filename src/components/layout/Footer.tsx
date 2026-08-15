"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
      <path d="M15 8.5h-2c-.8 0-1.5.7-1.5 1.5v2h3.5l-.5 3H11.5v7h-3v-7H6.5v-3H8.5v-2.2C8.5 6.9 10.2 5 12.8 5H15v3.5z" />
    </svg>
  );
}

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-obsidian">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <span className="font-display text-2xl font-semibold tracking-luxe text-cream">LYNUX</span>
            <p className="max-w-sm text-sm text-muted-foreground">{t.footer.description}</p>
            <div className="flex items-center gap-4 pt-1">
              <a
                href="#"
                aria-label={t.footer.instagram}
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                aria-label={t.footer.facebook}
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-luxe text-gold">{t.footer.shop}</p>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/catalog" className="transition-colors hover:text-cream">
                {t.nav.catalog}
              </Link>
              <Link href="/scent-finder" className="transition-colors hover:text-cream">
                {t.nav.scentFinder}
              </Link>
              <Link href="/custom-blend" className="transition-colors hover:text-cream">
                {t.nav.layeringLab}
              </Link>
              <Link href="/sample-discovery" className="transition-colors hover:text-cream">
                {t.nav.discoverySet}
              </Link>
              <Link href="/checkout" className="transition-colors hover:text-cream">
                {t.footer.checkout}
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-luxe text-gold">{t.footer.assistance}</p>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/track-order" className="transition-colors hover:text-cream">
                {t.footer.trackOrder}
              </Link>
              <span className="cursor-default">{t.footer.shippingReturns}</span>
              <span className="cursor-default">{t.footer.contact}</span>
              <span className="cursor-default">{t.footer.termsPrivacy}</span>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-1 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>{t.footer.rights(new Date().getFullYear())}</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {t.footer.demoNotice}
          </p>
        </div>
      </div>
    </footer>
  );
}
