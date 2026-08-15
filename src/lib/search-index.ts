import { products, olfactoryFamilies } from "@/data/products";
import type { OlfactoryNotes } from "@/types/product";
import type { Dictionary, Locale } from "@/lib/i18n/dictionary";
import { localizeProduct } from "@/lib/i18n/localize-product";

export type SearchItemType = "product" | "note" | "family" | "page";

export interface SearchItem {
  type: SearchItemType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  accent?: string;
}

export function buildSearchIndex(t: Dictionary, locale: Locale): SearchItem[] {
  const localizedProducts = products.map((product) => localizeProduct(product, locale));

  const productItems: SearchItem[] = localizedProducts.map((product) => ({
    type: "product",
    id: `product-${product.id}`,
    title: product.name,
    subtitle: `${t.families[product.family]} · ${t.concentrations[product.concentration]}`,
    href: `/product/${product.slug}`,
    accent: product.accent,
  }));

  const noteItems: SearchItem[] = localizedProducts.flatMap((product) =>
    (Object.keys(product.notes) as (keyof OlfactoryNotes)[]).flatMap((tier) =>
      product.notes[tier].map((note) => ({
        type: "note" as const,
        id: `note-${product.id}-${tier}-${note}`,
        title: note,
        subtitle: `${t.commandPalette.noteTiers[tier]} · ${product.name}`,
        href: `/product/${product.slug}`,
        accent: product.accent,
      })),
    ),
  );

  const familyItems: SearchItem[] = olfactoryFamilies.map((family) => ({
    type: "family",
    id: `family-${family}`,
    title: t.families[family],
    subtitle: t.commandPalette.familySubtitle,
    href: `/catalog?family=${encodeURIComponent(family)}`,
  }));

  const staticPages: SearchItem[] = [
    { type: "page", id: "page-home", title: t.commandPalette.pages.home.title, subtitle: t.commandPalette.pages.home.subtitle, href: "/" },
    { type: "page", id: "page-catalog", title: t.commandPalette.pages.catalog.title, subtitle: t.commandPalette.pages.catalog.subtitle, href: "/catalog" },
    { type: "page", id: "page-scent-finder", title: t.commandPalette.pages.scentFinder.title, subtitle: t.commandPalette.pages.scentFinder.subtitle, href: "/scent-finder" },
    { type: "page", id: "page-blend", title: t.commandPalette.pages.blend.title, subtitle: t.commandPalette.pages.blend.subtitle, href: "/custom-blend" },
    { type: "page", id: "page-track-order", title: t.commandPalette.pages.trackOrder.title, subtitle: t.commandPalette.pages.trackOrder.subtitle, href: "/track-order" },
    { type: "page", id: "page-checkout", title: t.commandPalette.pages.checkout.title, subtitle: t.commandPalette.pages.checkout.subtitle, href: "/checkout" },
  ];

  return [...productItems, ...noteItems, ...familyItems, ...staticPages];
}
