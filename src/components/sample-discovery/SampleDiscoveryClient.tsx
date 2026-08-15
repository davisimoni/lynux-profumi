"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, ShoppingBag, Ticket } from "lucide-react";
import { toast } from "sonner";
import { products } from "@/data/products";
import { ProductArt } from "@/components/product/ProductArt";
import { cn } from "@/lib/utils";
import { useMoney } from "@/hooks/use-money";
import { useCartStore } from "@/store/cart";
import {
  DISCOVERY_SET_SAMPLE_COUNT,
  DISCOVERY_SET_SUFFIX,
  DISCOVERY_SET_TOTAL_PRICE,
  DISCOVERY_SET_UNIT_PRICE,
} from "@/lib/checkout/pricing";

const SAMPLE_SIZE_LABEL = "Sample Kit (10ml)";

function referenceSamplePrice(productId: string): number {
  const product = products.find((candidate) => candidate.id === productId);
  return product?.sizes.find((size) => size.label === SAMPLE_SIZE_LABEL)?.price ?? 0;
}

export function SampleDiscoveryClient() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const addItem = useCartStore((state) => state.addItem);
  const money = useMoney();

  const fullPrice = useMemo(
    () => Array.from(selected).reduce((sum, id) => sum + referenceSamplePrice(id), 0),
    [selected],
  );

  const remaining = DISCOVERY_SET_SAMPLE_COUNT - selected.size;
  const isComplete = selected.size === DISCOVERY_SET_SAMPLE_COUNT;

  function toggle(productId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else if (next.size < DISCOVERY_SET_SAMPLE_COUNT) {
        next.add(productId);
      }
      return next;
    });
  }

  function handleAddToCart() {
    if (!isComplete) return;

    for (const productId of selected) {
      const product = products.find((candidate) => candidate.id === productId);
      if (!product) continue;
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        family: product.family,
        sizeLabel: `${SAMPLE_SIZE_LABEL}${DISCOVERY_SET_SUFFIX}`,
        sizeMl: 10,
        unitPrice: DISCOVERY_SET_UNIT_PRICE,
        accent: product.accent,
      });
    }

    toast.success("Discovery Set aggiunto al carrello", {
      description: `5 campioni · ${money(DISCOVERY_SET_TOTAL_PRICE)}`,
    });
    setSelected(new Set());
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col items-center gap-3 text-center">
        <p className="text-xs uppercase tracking-luxe text-gold">Discovery Set · 5x10ml</p>
        <h1 className="font-display text-4xl font-semibold text-cream sm:text-5xl">
          Componi la tua Collezione di Scoperta
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Scegli 5 fragranze Lynux in formato campione da 10ml a un prezzo promozionale unico. Ogni
          Discovery Set include inoltre la promessa di un voucher di pari importo, da utilizzare
          sull&apos;acquisto di un formato 100ml entro 60 giorni.
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-lg items-center gap-3 rounded-sm border border-gold/30 bg-gold/5 px-5 py-4 text-left">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
          <Ticket className="h-4 w-4" />
        </span>
        <p className="text-xs text-muted-foreground">
          <span className="text-gold">Promessa Lynux Vault:</span> {money(DISCOVERY_SET_TOTAL_PRICE)}{" "}
          spesi oggi diventano un voucher di pari importo verso il tuo prossimo flacone da 100ml.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => {
          const isSelected = selected.has(product.id);
          const isDisabled = !isSelected && isComplete;

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggle(product.id)}
              disabled={isDisabled}
              className={cn(
                "group relative overflow-hidden rounded-md border text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                isSelected ? "border-gold" : "border-border hover:border-gold/50",
              )}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-obsidian">
                <ProductArt accent={product.accent} accentSoft={product.accentSoft} variant="bottle" />
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-obsidian"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.span>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate font-display text-sm text-cream">{product.name}</p>
                <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                  {product.family}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="glass-panel sticky bottom-4 mt-10 flex flex-col items-center gap-4 rounded-md p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {isComplete
              ? "Selezione completa"
              : `Seleziona ancora ${remaining} ${remaining === 1 ? "fragranza" : "fragranze"}`}
          </p>
          <p className="mt-1 flex items-baseline justify-center gap-2 sm:justify-start">
            <span className="font-display text-2xl text-gold">{money(DISCOVERY_SET_TOTAL_PRICE)}</span>
            {fullPrice > DISCOVERY_SET_TOTAL_PRICE && (
              <span className="text-sm text-muted-foreground line-through">{money(fullPrice)}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isComplete}
          className="flex items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3.5 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Aggiungi il Discovery Set ({selected.size}/{DISCOVERY_SET_SAMPLE_COUNT})
        </button>
      </div>
    </div>
  );
}
