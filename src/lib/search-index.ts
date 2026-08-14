import { products, olfactoryFamilies } from "@/data/products";
import type { OlfactoryNotes } from "@/types/product";

export type SearchItemType = "product" | "note" | "family" | "page";

export interface SearchItem {
  type: SearchItemType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  accent?: string;
}

const NOTE_TIER_LABELS: Record<keyof OlfactoryNotes, string> = {
  top: "Nota di Testa",
  heart: "Nota di Cuore",
  base: "Nota di Fondo",
};

const STATIC_PAGES: SearchItem[] = [
  { type: "page", id: "page-home", title: "Home", subtitle: "Pagina principale", href: "/" },
  {
    type: "page",
    id: "page-catalog",
    title: "Catalogo",
    subtitle: "Tutte le fragranze Lynux",
    href: "/catalog",
  },
  {
    type: "page",
    id: "page-scent-finder",
    title: "Scent Finder",
    subtitle: "Quiz olfattivo personalizzato",
    href: "/scent-finder",
  },
  {
    type: "page",
    id: "page-blend",
    title: "Layering Lab",
    subtitle: "Combina due fragranze in un Duo Set",
    href: "/custom-blend",
  },
  {
    type: "page",
    id: "page-track-order",
    title: "Traccia il tuo Ordine",
    subtitle: "Stato di spedizione in tempo reale",
    href: "/track-order",
  },
  {
    type: "page",
    id: "page-checkout",
    title: "Checkout",
    subtitle: "Completa il tuo ordine",
    href: "/checkout",
  },
];

export function buildSearchIndex(): SearchItem[] {
  const productItems: SearchItem[] = products.map((product) => ({
    type: "product",
    id: `product-${product.id}`,
    title: product.name,
    subtitle: `${product.family} · ${product.concentration}`,
    href: `/product/${product.slug}`,
    accent: product.accent,
  }));

  const noteItems: SearchItem[] = products.flatMap((product) =>
    (Object.keys(product.notes) as (keyof OlfactoryNotes)[]).flatMap((tier) =>
      product.notes[tier].map((note) => ({
        type: "note" as const,
        id: `note-${product.id}-${tier}-${note}`,
        title: note,
        subtitle: `${NOTE_TIER_LABELS[tier]} · ${product.name}`,
        href: `/product/${product.slug}`,
        accent: product.accent,
      })),
    ),
  );

  const familyItems: SearchItem[] = olfactoryFamilies.map((family) => ({
    type: "family",
    id: `family-${family}`,
    title: family,
    subtitle: "Famiglia Olfattiva",
    href: `/catalog?family=${encodeURIComponent(family)}`,
  }));

  return [...productItems, ...noteItems, ...familyItems, ...STATIC_PAGES];
}
