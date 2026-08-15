"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, ShoppingBag, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { ProductArt, type ProductArtVariant } from "@/components/product/ProductArt";
import { OlfactoryPyramid } from "@/components/product/OlfactoryPyramid";
import { ScentMeter } from "@/components/product/ScentMeter";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useFlyToCartStore } from "@/store/fly-to-cart";
import { useMoney } from "@/hooks/use-money";

const GALLERY: { variant: ProductArtVariant; label: string }[] = [
  { variant: "bottle", label: "Flacone" },
  { variant: "aura", label: "Aura Olfattiva" },
  { variant: "liquid", label: "Texture" },
  { variant: "cap", label: "Dettaglio Tappo" },
];

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((state) => state.addItem);
  const triggerFlyToCart = useFlyToCartStore((state) => state.trigger);
  const money = useMoney();
  const [activeVariant, setActiveVariant] = useState<ProductArtVariant>("bottle");
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const buySectionRef = useRef<HTMLDivElement>(null);

  const selectedSize = product.sizes[selectedSizeIndex] ?? product.sizes[0];

  useEffect(() => {
    const pending = timeouts.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const target = buySectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    if (status !== "idle") return;
    setStatus("adding");

    const rect = event.currentTarget.getBoundingClientRect();
    triggerFlyToCart({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, product.accent);

    timeouts.current.push(
      setTimeout(() => {
        addItem(
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            family: product.family,
            sizeLabel: selectedSize.label,
            sizeMl: selectedSize.ml,
            unitPrice: selectedSize.price,
            accent: product.accent,
          },
          quantity,
        );
        toast.success(`${product.name} aggiunto al carrello`, {
          description: `${selectedSize.label} · Quantità ${quantity}`,
        });
        setStatus("added");
      }, 450),
    );

    timeouts.current.push(
      setTimeout(() => {
        setStatus("idle");
      }, 1900),
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="aspect-square overflow-hidden rounded-md border border-border bg-obsidian">
            <ProductArt accent={product.accent} accentSoft={product.accentSoft} variant={activeVariant} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {GALLERY.map(({ variant, label }) => (
              <button
                key={variant}
                type="button"
                onClick={() => setActiveVariant(variant)}
                aria-label={label}
                className={cn(
                  "aspect-square overflow-hidden rounded-sm border bg-obsidian transition-colors cursor-pointer",
                  activeVariant === variant ? "border-gold" : "border-border hover:border-gold/50",
                )}
              >
                <ProductArt accent={product.accent} accentSoft={product.accentSoft} variant={variant} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-luxe text-gold">
            {product.family} · {product.gender}
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-cream sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">{product.tagline}</p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-5 space-y-2 rounded-sm border border-border p-4">
            <ScentMeter label="Scia" value={product.sillage} />
            <ScentMeter label="Durata" value={product.longevity} />
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-luxe text-gold">Formato</p>
            <div className="grid grid-cols-3 gap-3">
              {product.sizes.map((size, index) => (
                <button
                  key={size.label}
                  type="button"
                  onClick={() => setSelectedSizeIndex(index)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-sm border px-2 py-3 text-center transition-colors cursor-pointer",
                    selectedSizeIndex === index
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-gold/40",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs uppercase tracking-wide",
                      selectedSizeIndex === index ? "text-gold" : "text-cream",
                    )}
                  >
                    {size.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{money(size.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div ref={buySectionRef} className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-sm border border-border px-3 py-2.5">
              <button
                type="button"
                aria-label="Diminuisci quantità"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-muted-foreground hover:text-gold cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm text-cream">{quantity}</span>
              <button
                type="button"
                aria-label="Aumenta quantità"
                onClick={() => setQuantity((q) => Math.min(9, q + 1))}
                className="text-muted-foreground hover:text-gold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={status !== "idle"}
              className={cn(
                "flex flex-1 min-w-[220px] items-center justify-center gap-2 rounded-sm py-3.5 text-xs uppercase tracking-luxe transition-all cursor-pointer disabled:cursor-default",
                status === "added" ? "bg-gold/90 text-obsidian" : "bg-gold text-obsidian hover:opacity-90",
              )}
            >
              {status === "idle" && (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Aggiungi al Carrello · {money(selectedSize.price * quantity)}
                </>
              )}
              {status === "adding" && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Aggiunta in corso
                </>
              )}
              {status === "added" && (
                <>
                  <Check className="h-4 w-4" />
                  Aggiunto al Carrello
                </>
              )}
            </button>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <p className="text-xs uppercase tracking-luxe text-gold">La Storia</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.story}</p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <OlfactoryPyramid notes={product.notes} />
      </div>

      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel fixed inset-x-0 bottom-0 z-30 border-t"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="hidden h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-obsidian sm:block">
                <ProductArt accent={product.accent} accentSoft={product.accentSoft} variant="bottle" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm text-cream sm:text-base">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">{selectedSize.label}</p>
              </div>
              <span className="font-display text-base text-gold sm:text-lg">
                {money(selectedSize.price * quantity)}
              </span>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={status !== "idle"}
                className="flex shrink-0 items-center gap-2 rounded-sm bg-gold px-4 py-2.5 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 disabled:opacity-70 cursor-pointer sm:px-6"
              >
                {status === "idle" && (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Aggiungi al Carrello</span>
                    <span className="sm:hidden">Aggiungi</span>
                  </>
                )}
                {status === "adding" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {status === "added" && <Check className="h-3.5 w-3.5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
