"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductArt } from "@/components/product/ProductArt";
import { ScentMeter } from "@/components/product/ScentMeter";
import { cn } from "@/lib/utils";
import { useMoney } from "@/hooks/use-money";
import { useCartStore } from "@/store/cart";
import { useQuickViewStore } from "@/store/quick-view";
import { useTranslation } from "@/hooks/use-translation";
import { localizeProduct } from "@/lib/i18n/localize-product";

export function QuickViewModal() {
  const rawProduct = useQuickViewStore((state) => state.product);
  const close = useQuickViewStore((state) => state.close);
  const addItem = useCartStore((state) => state.addItem);
  const money = useMoney();
  const { locale, t } = useTranslation();
  const product = rawProduct ? localizeProduct(rawProduct, locale) : null;

  const PYRAMID_ROWS = [
    { key: "top" as const, label: t.product.pyramid.tiers.top.label },
    { key: "heart" as const, label: t.product.pyramid.tiers.heart.label },
    { key: "base" as const, label: t.product.pyramid.tiers.base.label },
  ];

  const purchasableSizes = product?.sizes.filter((size) => size.label !== "Sample Kit (10ml)") ?? [];
  const [sizeLabel, setSizeLabel] = useState<string | null>(null);
  const activeSizeLabel = sizeLabel ?? purchasableSizes[0]?.label ?? null;
  const activeSize = purchasableSizes.find((size) => size.label === activeSizeLabel) ?? purchasableSizes[0];

  function handleOpenChange(next: boolean) {
    if (!next) {
      close();
      setSizeLabel(null);
    }
  }

  function handleAddToCart() {
    if (!product || !activeSize) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      family: product.family,
      sizeLabel: activeSize.label,
      sizeMl: activeSize.ml,
      unitPrice: activeSize.price,
      accent: product.accent,
    });
    toast.success(t.product.quickView.addedToast(product.name), { description: activeSize.label });
    handleOpenChange(false);
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto border border-border bg-obsidian-raised p-0 sm:max-w-3xl">
        {product && (
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="aspect-square overflow-hidden bg-obsidian sm:aspect-auto sm:h-full">
              <ProductArt accent={product.accent} accentSoft={product.accentSoft} variant="bottle" />
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <DialogTitle className="font-sans text-[11px] normal-case tracking-luxe text-gold uppercase">
                {t.product.quickView.eyebrow}
              </DialogTitle>
              <h2 className="mt-2 font-display text-2xl text-cream sm:text-3xl">{product.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                {t.families[product.family]} · {t.concentrations[product.concentration]}
              </p>

              <div className="mt-4 space-y-1.5">
                <ScentMeter label={t.product.detail.sillage} value={product.sillage} compact />
                <ScentMeter label={t.product.detail.longevity} value={product.longevity} compact />
              </div>

              <div className="mt-5 space-y-1.5 border-t border-border pt-4">
                {PYRAMID_ROWS.map((row) => (
                  <p key={row.key} className="text-xs text-muted-foreground">
                    <span className="text-gold">{row.label}: </span>
                    {product.notes[row.key].join(", ")}
                  </p>
                ))}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[11px] uppercase tracking-luxe text-gold">{t.product.quickView.formatLabel}</p>
                <div className="flex gap-2">
                  {purchasableSizes.map((size) => (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => setSizeLabel(size.label)}
                      className={cn(
                        "flex-1 rounded-sm border px-3 py-2.5 text-center text-xs uppercase tracking-wide transition-colors cursor-pointer",
                        activeSizeLabel === size.label
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border text-cream hover:border-gold/40",
                      )}
                    >
                      {size.label}
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {money(size.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 rounded-sm bg-gold py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 cursor-pointer"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {t.product.quickView.addToCart} · {activeSize ? money(activeSize.price) : ""}
                </button>
                <Link
                  href={`/product/${product.slug}`}
                  onClick={() => handleOpenChange(false)}
                  className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-gold"
                >
                  {t.product.quickView.viewDetails}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
