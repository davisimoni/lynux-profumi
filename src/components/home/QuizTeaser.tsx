import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProductArt } from "@/components/product/ProductArt";

export function QuizTeaser() {
  return (
    <section className="border-b border-border">
      <Link
        href="/scent-finder"
        className="group relative block overflow-hidden"
      >
        <div className="absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-60">
          <ProductArt accent="#C5A059" accentSoft="#241a08" variant="liquid" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-obsidian/30" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-20 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2 text-xs uppercase tracking-luxe text-gold">
            <Sparkles className="h-4 w-4" />
            Scent Discovery Quiz
          </span>
          <h2 className="max-w-lg font-display text-3xl font-semibold leading-tight text-cream sm:text-4xl">
            Non sai quale fragranza scegliere?
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Tre domande. Un profumo. Lascia che il tuo carattere olfattivo ti guidi verso la
            fragranza Lynux pensata per te.
          </p>
          <span className="mt-2 flex items-center gap-2 text-xs uppercase tracking-luxe text-cream transition-colors group-hover:text-gold">
            Inizia il Quiz
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </section>
  );
}
