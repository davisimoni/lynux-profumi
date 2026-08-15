import type { Product } from "@/types/product";
import type { Locale } from "@/lib/i18n/dictionary";
import { productTranslations } from "@/data/products.en";

/**
 * Returns `product` with its display-only prose fields (tagline,
 * description, story, notes) swapped for the English translation when
 * `locale` is "en". `family`/`gender`/`concentration`/sizes/accent and every
 * other structural field are left untouched — they're canonical and drive
 * filtering/business logic elsewhere, not just display.
 */
export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === "it") return product;

  const translation = productTranslations[product.id];
  if (!translation) return product;

  return {
    ...product,
    tagline: translation.tagline,
    description: translation.description,
    story: translation.story,
    notes: translation.notes,
  };
}

export function localizeProducts(products: Product[], locale: Locale): Product[] {
  if (locale === "it") return products;
  return products.map((product) => localizeProduct(product, locale));
}
