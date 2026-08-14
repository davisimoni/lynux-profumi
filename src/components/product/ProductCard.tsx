"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { ProductArt } from "@/components/product/ProductArt";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { useFlyToCartStore } from "@/store/fly-to-cart";
import { useMoney } from "@/hooks/use-money";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const triggerFlyToCart = useFlyToCartStore((state) => state.trigger);
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

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative overflow-hidden rounded-md border border-border bg-card transition-colors duration-300 hover:border-gold/50 hover:shadow-[0_20px_40px_-24px_rgba(212,175,55,0.35)]"
    >
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Vedi dettagli di ${product.name}`}
      />

      <div className="relative aspect-[4/5] overflow-hidden bg-obsidian">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <ProductArt accent={product.accent} accentSoft={product.accentSoft} variant="bottle" />
        </div>
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
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">
            {product.family} · {product.concentration}
          </p>
          <h3 className="font-display text-xl text-cream">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.tagline}</p>
        </div>

        <p className="text-xs text-muted-foreground/80">
          {product.notes.top.slice(0, 3).join(" · ")}
        </p>

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
