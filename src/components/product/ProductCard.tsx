"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Concentration, Product } from "@/types/product";
import { ProductArt } from "@/components/product/ProductArt";
import { ScentMeter } from "@/components/product/ScentMeter";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { useFlyToCartStore } from "@/store/fly-to-cart";
import { useQuickViewStore } from "@/store/quick-view";
import { useMoney } from "@/hooks/use-money";

const CONCENTRATION_PERCENT: Record<Concentration, string> = {
  "Extrait de Parfum": "25%",
  "Eau de Parfum": "18%",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const triggerFlyToCart = useFlyToCartStore((state) => state.trigger);
  const openQuickView = useQuickViewStore((state) => state.open);
  const money = useMoney();
  const defaultSize = product.sizes[1] ?? product.sizes[0];

  function handleQuickAdd(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    triggerFlyToCart({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, product.accent);

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
    toast.success(`${product.name} aggiunto al carrello`, {
      description: defaultSize.label,
    });
  }

  function handleQuickView(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    openQuickView(product);
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative overflow-hidden rounded-md border border-border bg-card backdrop-blur-xl transition-all duration-300 hover:border-gold/60 hover:shadow-[0_24px_48px_-24px_rgba(216,180,91,0.4)]"
    >
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Vedi dettagli di ${product.name}`}
      />

      <div className="relative aspect-[4/5] overflow-hidden bg-obsidian">
        <div className="absolute inset-0 transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.08] group-hover:saturate-[0.85] group-hover:brightness-95">
          <ProductArt accent={product.accent} accentSoft={product.accentSoft} variant="bottle" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.bestseller && (
            <Badge className="border-none bg-gold text-obsidian tracking-wide">Bestseller</Badge>
          )}
          {product.isNew && (
            <Badge variant="outline" className="border-gold/60 text-gold tracking-wide">
              Novità
            </Badge>
          )}
        </div>
        <span className="absolute bottom-3 left-3 rounded-sm border border-gold/25 bg-obsidian/60 px-2.5 py-1 text-[10px] uppercase tracking-wide text-gold/90 backdrop-blur-sm">
          {product.concentration} · {CONCENTRATION_PERCENT[product.concentration]}
        </span>
        <button
          type="button"
          onClick={handleQuickView}
          aria-label={`Anteprima olfattiva di ${product.name}`}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-obsidian/70 text-cream opacity-100 backdrop-blur-sm transition-all duration-300 hover:border-gold hover:text-gold sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-6">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">
            {product.family}
          </p>
          <h3 className="font-display text-xl tracking-tight text-cream">{product.name}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
        </div>

        <p className="text-xs text-muted-foreground/80">
          {product.notes.top.slice(0, 3).join(" · ")}
        </p>

        <div className="space-y-1.5 border-t border-border pt-4">
          <ScentMeter label="Scia" value={product.sillage} compact />
          <ScentMeter label="Durata" value={product.longevity} compact />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="font-display text-lg text-gold">
            {money(defaultSize.price)}
          </span>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="relative z-20 flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-wide text-cream transition-colors duration-300 hover:border-gold hover:text-gold cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Aggiungi
          </button>
        </div>
      </div>
    </motion.div>
  );
}
