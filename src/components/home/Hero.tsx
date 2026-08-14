import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductArt } from "@/components/product/ProductArt";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <ProductArt accent="#D4AF37" accentSoft="#1a1208" variant="aura" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/80" />

      <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="animate-fade-up text-xs uppercase tracking-luxe text-gold">
          Alta Profumeria di Nicchia
        </p>
        <h1
          className="animate-fade-up mt-6 max-w-3xl font-display text-5xl font-light leading-[1.1] text-cream sm:text-6xl md:text-7xl"
          style={{ animationDelay: "0.1s" }}
        >
          Essence of <span className="text-gold-gradient italic">Unseen</span> Luxury
        </h1>
        <p
          className="animate-fade-up mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
          style={{ animationDelay: "0.2s" }}
        >
          Fragranze rare, composte con materie prime pregiate e destinate a chi non cerca
          l&apos;approvazione altrui, ma la propria essenza.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/catalog"
            className="group flex items-center gap-2 rounded-sm bg-gold px-8 py-3.5 text-xs uppercase tracking-luxe text-obsidian transition-all hover:opacity-90"
          >
            Esplora le Fragranze
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/scent-finder"
            className="rounded-sm border border-border px-8 py-3.5 text-xs uppercase tracking-luxe text-cream transition-colors hover:border-gold hover:text-gold"
          >
            Trova la tua Fragranza
          </Link>
        </div>
      </div>
    </section>
  );
}
