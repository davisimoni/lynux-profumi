"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { useTranslation } from "@/hooks/use-translation";

export function Bestsellers() {
  const { t } = useTranslation();
  const bestsellers = products.filter((product) => product.bestseller).slice(0, 3);

  return (
    <section className="border-b border-border bg-obsidian">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs uppercase tracking-luxe text-gold">{t.bestsellers.eyebrow}</p>
          <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
            {t.bestsellers.title}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/catalog"
            className="group flex items-center gap-2 text-xs uppercase tracking-luxe text-cream transition-colors hover:text-gold"
          >
            {t.bestsellers.viewAll}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
