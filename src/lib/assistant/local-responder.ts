import Fuse from "fuse.js";
import { products, olfactoryFamilies } from "@/data/products";
import { describeProduct } from "@/lib/assistant/knowledge-base";
import { formatMoney } from "@/lib/currency";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from "@/lib/constants";
import type { OlfactoryFamily, Product } from "@/types/product";
import { dictionaries, type Locale } from "@/lib/i18n/dictionary";
import { localizeProduct } from "@/lib/i18n/localize-product";

export interface AssistantReply {
  text: string;
  link?: { href: string; label: string };
}

// Unicode range U+0300-U+036F covers combining diacritical marks left
// behind by NFD decomposition (e.g. "é" -> "e" + U+0301) — stripping them
// lets "imperiale" match "Impériale" and similar accented product names.
const COMBINING_DIACRITICS = /[̀-ͯ]/gu;

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

// --- Product lookup: substring match first (reliable for full/partial
// names), Fuse as a typo-tolerant fallback on individual words. -------------

const productFuse = new Fuse(products, { keys: ["name"], threshold: 0.4, includeScore: true });

function matchProduct(message: string): Product | null {
  const normalized = normalize(message);

  for (const product of products) {
    if (normalized.includes(normalize(product.name))) return product;
  }

  const words = normalized.split(/\W+/).filter((word) => word.length > 3);
  for (const word of words) {
    const [best] = productFuse.search(word);
    if (best && (best.score ?? 1) < 0.35) return best.item;
  }

  return null;
}

// Matches both the canonical (Italian) family value and its localized
// display name, so "woody" finds "Legnosi" just as well as "legnosi" does.
function matchFamily(message: string, locale: Locale): OlfactoryFamily | null {
  const normalized = normalize(message);
  const familyLabels = dictionaries[locale].families;
  return (
    olfactoryFamilies.find(
      (family) => normalized.includes(normalize(family)) || normalized.includes(normalize(familyLabels[family])),
    ) ?? null
  );
}

// --- General FAQ: keyword-containment scoring — more robust than raw
// fuzzy string-distance for free-form sentences of very different length. --

function matchFaq(message: string, locale: Locale) {
  const normalizedMessage = normalize(message);
  const faq = dictionaries[locale].assistant.faq;
  let best: { entry: (typeof faq)[number]; score: number } | null = null;

  for (const entry of faq) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (normalizedMessage.includes(normalize(keyword))) {
        score += keyword.split(" ").length;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best?.entry ?? null;
}

export function getLocalResponse(message: string, locale: Locale): AssistantReply {
  const t = dictionaries[locale].assistant;
  const family = matchFamily(message, locale);
  const product = matchProduct(message);

  if (product) {
    return {
      text: describeProduct(product, locale),
      link: { href: `/product/${product.slug}`, label: t.viewProduct(product.name) },
    };
  }

  if (family) {
    const familyLabel = dictionaries[locale].families[family];
    const matches = products.filter((candidate) => candidate.family === family);
    const list = matches
      .map((candidate) => {
        const localized = localizeProduct(candidate, locale);
        return `${localized.name} (${formatMoney(localized.sizes[1].price, "EUR")} · ${localized.tagline})`;
      })
      .join(", ");
    return {
      text: `${t.familyIntro(familyLabel)} ${list}.`,
      link: { href: `/catalog?family=${encodeURIComponent(family)}`, label: t.viewFamily(familyLabel.toLowerCase()) },
    };
  }

  const faq = matchFaq(message, locale);
  if (faq) {
    const answer =
      faq.id === "shipping"
        ? t.shippingAnswer(formatMoney(FREE_SHIPPING_THRESHOLD, "EUR"), formatMoney(STANDARD_SHIPPING_COST, "EUR"))
        : faq.answer;
    return { text: answer, link: faq.link };
  }

  return t.fallback;
}
