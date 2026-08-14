"use client";

import { useMemo, useState } from "react";
import { Download, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { products } from "@/data/products";
import { computeHarmony, mergeNotes } from "@/lib/scent-compatibility";
import { ProductArt } from "@/components/product/ProductArt";
import { OlfactoryPyramid } from "@/components/product/OlfactoryPyramid";
import { HarmonyGauge } from "@/components/blend/HarmonyGauge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMoney } from "@/hooks/use-money";
import { useCartStore } from "@/store/cart";

const DUO_DISCOUNT = 0.1;

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function BlendLab() {
  const [productAId, setProductAId] = useState(products[0].id);
  const [productBId, setProductBId] = useState(products[2].id);
  const [sizeIndex, setSizeIndex] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const money = useMoney();

  const productA = products.find((p) => p.id === productAId) ?? products[0];
  const productB = products.find((p) => p.id === productBId) ?? products[1];

  const harmony = useMemo(() => computeHarmony(productA, productB), [productA, productB]);
  const mergedNotes = useMemo(() => mergeNotes(productA, productB), [productA, productB]);

  const sizeA = productA.sizes[sizeIndex] ?? productA.sizes[0];
  const sizeB = productB.sizes[sizeIndex] ?? productB.sizes[0];
  const fullPrice = sizeA.price + sizeB.price;
  const discountedPrice = Math.round(fullPrice * (1 - DUO_DISCOUNT));

  function handleSelectA(id: string | null) {
    if (!id) return;
    if (id === productBId) {
      setProductBId(productAId);
    }
    setProductAId(id);
  }

  function handleSelectB(id: string | null) {
    if (!id) return;
    if (id === productAId) {
      setProductAId(productBId);
    }
    setProductBId(id);
  }

  function handleAddDuoToCart() {
    const discountedUnitA = Math.round(sizeA.price * (1 - DUO_DISCOUNT));
    const discountedUnitB = Math.round(sizeB.price * (1 - DUO_DISCOUNT));

    addItem({
      productId: productA.id,
      slug: productA.slug,
      name: productA.name,
      family: productA.family,
      sizeLabel: `${sizeA.label} · Duo Set`,
      sizeMl: sizeA.ml,
      unitPrice: discountedUnitA,
      accent: productA.accent,
    });
    addItem({
      productId: productB.id,
      slug: productB.slug,
      name: productB.name,
      family: productB.family,
      sizeLabel: `${sizeB.label} · Duo Set`,
      sizeMl: sizeB.ml,
      unitPrice: discountedUnitB,
      accent: productB.accent,
    });

    toast.success("Duo Set aggiunto al carrello", {
      description: `${productA.name} + ${productB.name} · ${sizeA.label}`,
    });
  }

  function handleDownloadProfile() {
    const date = new Date().toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const content = `LYNUX PROFUMI — LAYERING LAB
Profilo di Fragranza Combinato

Fragranza A: ${productA.name} (${productA.family})
Fragranza B: ${productB.name} (${productB.family})

Scent Harmony Score: ${harmony.score}% — ${harmony.label}
${harmony.narrative}

PIRAMIDE OLFATTIVA COMBINATA
Note di Testa: ${mergedNotes.top.join(", ")}
Note di Cuore: ${mergedNotes.heart.join(", ")}
Note di Fondo: ${mergedNotes.base.join(", ")}

Generato il ${date} — lynuxprofumi.com (progetto demo di portfolio)
`;

    downloadTextFile(
      `lynux-layering-${productA.slug}-${productB.slug}.txt`,
      content,
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-2 text-xs uppercase tracking-luxe text-gold">
          <Sparkles className="h-4 w-4" />
          Custom Blend
        </p>
        <h1 className="font-display text-4xl font-light text-cream sm:text-5xl">
          Lynux Layering Lab
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Combina due fragranze Lynux e scopri il loro Scent Harmony Score: un&apos;analisi delle
          famiglie olfattive che genera una firma unica, fusa in un&apos;unica piramide combinata.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-5">
          <p className="mb-3 text-xs uppercase tracking-luxe text-gold">Fragranza A</p>
          <div className="aspect-square overflow-hidden rounded-sm bg-obsidian">
            <ProductArt accent={productA.accent} accentSoft={productA.accentSoft} variant="bottle" />
          </div>
          <Select value={productAId} onValueChange={handleSelectA}>
            <SelectTrigger className="mt-4 w-full border-border bg-transparent text-sm text-cream">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} — {product.family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <p className="mb-3 text-xs uppercase tracking-luxe text-gold">Fragranza B</p>
          <div className="aspect-square overflow-hidden rounded-sm bg-obsidian">
            <ProductArt accent={productB.accent} accentSoft={productB.accentSoft} variant="bottle" />
          </div>
          <Select value={productBId} onValueChange={handleSelectB}>
            <SelectTrigger className="mt-4 w-full border-border bg-transparent text-sm text-cream">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} — {product.family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center rounded-md border border-gold/30 bg-card px-6 py-10">
        <HarmonyGauge score={harmony.score} label={harmony.label} />
        <p className="mt-6 max-w-md text-center text-sm text-muted-foreground">
          {harmony.narrative}
        </p>
      </div>

      <div className="mt-10">
        <OlfactoryPyramid notes={mergedNotes} />
      </div>

      <div className="mt-10 rounded-md border border-border bg-card p-6 sm:p-8">
        <p className="mb-3 text-xs uppercase tracking-luxe text-gold">Formato del Duo Set</p>
        <div className="grid grid-cols-3 gap-3">
          {productA.sizes.map((size, index) => (
            <button
              key={size.label}
              type="button"
              onClick={() => setSizeIndex(index)}
              className={cn(
                "rounded-sm border px-2 py-3 text-center text-xs uppercase tracking-wide transition-colors cursor-pointer",
                sizeIndex === index
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-cream hover:border-gold/40",
              )}
            >
              {size.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {productA.name} + {productB.name} · sconto duo 10%
            </p>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl text-gold">{money(discountedPrice)}</span>
              <span className="text-sm text-muted-foreground line-through">
                {money(fullPrice)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleDownloadProfile}
              className="flex items-center justify-center gap-2 rounded-sm border border-border px-5 py-3 text-xs uppercase tracking-wide text-cream transition-colors hover:border-gold hover:text-gold cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Scarica il Profilo
            </button>
            <button
              type="button"
              onClick={handleAddDuoToCart}
              className="flex items-center justify-center gap-2 rounded-sm bg-gold px-5 py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Aggiungi il Duo Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
