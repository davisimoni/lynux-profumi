import { products } from "@/data/products";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST, VAT_RATE } from "@/lib/constants";
import { formatMoney } from "@/lib/currency";
import type { Product } from "@/types/product";
import { dictionaries, type Locale } from "@/lib/i18n/dictionary";
import { localizeProduct } from "@/lib/i18n/localize-product";

/**
 * The site's full knowledge, in one place — consumed two ways:
 *  - as the system-prompt grounding for the real Claude-backed assistant
 *    (`ANTHROPIC_API_KEY` configured), so it never has to guess a price;
 *  - as the corpus the local fallback responder searches with Fuse.js when
 *    no key is configured (the path that actually runs in this demo).
 * Both paths answer from the same source of truth, so the "trained on the
 * whole e-commerce" claim holds regardless of which path is active, and both
 * take a `locale` so the assistant replies in whichever language the
 * customer has selected in the header.
 */

export function describeProduct(product: Product, locale: Locale): string {
  const t = dictionaries[locale].assistant;
  const localized = localizeProduct(product, locale);
  const families = dictionaries[locale].families;
  const genders = dictionaries[locale].genders;
  const concentrations = dictionaries[locale].concentrations;

  const sizes = localized.sizes
    .map((size) => t.describeSizeAt(size.label, formatMoney(size.price, "EUR")))
    .join(", ");

  return [
    `${localized.name} (${families[localized.family]}, ${genders[localized.gender]}, ${concentrations[localized.concentration]})`,
    t.describeSlogan(localized.tagline),
    t.describeDescription(localized.description),
    t.describeNotes(localized.notes.top.join(", "), localized.notes.heart.join(", "), localized.notes.base.join(", ")),
    t.describeScale(localized.sillage, localized.longevity),
    t.describeSizes(sizes),
    localized.bestseller ? t.describeBestseller : "",
    localized.isNew ? t.describeNew : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildKnowledgeBaseText(locale: Locale): string {
  const t = dictionaries[locale].assistant;
  const catalogue = products.map((product) => `- ${describeProduct(product, locale)}`).join("\n");
  const free = formatMoney(FREE_SHIPPING_THRESHOLD, "EUR");
  const cost = formatMoney(STANDARD_SHIPPING_COST, "EUR");

  return `${t.systemPromptIntro}

${t.catalogHeading}:
${catalogue}

${t.shippingHeading}:
- ${t.shippingFreeOver(free, cost)}
- ${t.pricesIncludeVat(Math.round(VAT_RATE * 100))}
- ${t.paymentMethods}
- ${t.currencyNote}

${t.featuresHeading}:
- ${t.featureCatalog}
- ${t.featureQuiz}
- ${t.featureBlend}
- ${t.featureQuickView}
- ${t.featureTracking}
- ${t.featureReservation}
- ${t.featureAtmosphere}
- ${t.featureReviews}

${t.notesHeading}:
- ${t.noteDemo}
- ${t.noteOffTopic}`;
}
