import Fuse from "fuse.js";
import { products, olfactoryFamilies } from "@/data/products";
import { describeProduct } from "@/lib/assistant/knowledge-base";
import { formatMoney } from "@/lib/currency";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from "@/lib/constants";
import type { OlfactoryFamily, Product } from "@/types/product";

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

function matchFamily(message: string): OlfactoryFamily | null {
  const normalized = normalize(message);
  return olfactoryFamilies.find((family) => normalized.includes(normalize(family))) ?? null;
}

// --- General FAQ: keyword-containment scoring — more robust than raw
// fuzzy string-distance for free-form sentences of very different length. --

interface FaqEntry {
  id: string;
  keywords: string[];
  answer: string;
  link?: AssistantReply["link"];
}

const FAQ: FaqEntry[] = [
  {
    id: "shipping",
    keywords: ["spedizione", "consegna", "quanto tempo arriva", "tempi di consegna", "corriere"],
    answer: `La spedizione è gratuita sopra ${formatMoney(FREE_SHIPPING_THRESHOLD, "EUR")} di spesa, altrimenti costa ${formatMoney(STANDARD_SHIPPING_COST, "EUR")}. Ogni ordine arriva in una confezione luxury gift box.`,
  },
  {
    id: "payment",
    keywords: ["pagamento", "pagare", "carta di credito", "paypal", "apple pay", "sicuro", "sicurezza"],
    answer: "Puoi pagare con carta di credito (elaborata da Stripe, in modalità test in questa demo — prova la carta 4242 4242 4242 4242), oppure con Apple Pay o PayPal simulati. Nessun dato di pagamento reale viene mai processato in questo progetto dimostrativo.",
  },
  {
    id: "tracking",
    keywords: ["tracciare ordine", "dov'è il mio ordine", "stato ordine", "spedito", "codice ordine"],
    answer: "Dopo l'acquisto ricevi un codice ordine univoco. Inseriscilo nella pagina di tracciamento per seguire lo stato di spedizione in tempo reale, da qualsiasi dispositivo.",
    link: { href: "/track-order", label: "Traccia il tuo ordine" },
  },
  {
    id: "reservation",
    keywords: ["riservato per te", "timer", "quanto tempo ho per pagare", "prenotazione scaduta"],
    answer: "Quando arrivi al checkout, gli articoli nel carrello vengono riservati per 10 minuti — è il piccolo timer \"Riservato per te\" che vedi nel riepilogo ordine. Se scade, aggiorna la pagina: lo stock viene ricontrollato e riservato di nuovo automaticamente.",
  },
  {
    id: "quiz",
    keywords: ["non so quale scegliere", "consiglio profumo", "quiz", "quale profumo fa per me"],
    answer: "Il modo più rapido è lo Scent Finder: tre domande veloci su stagione, atmosfera e note preferite, e ti consiglio la fragranza Lynux più adatta a te.",
    link: { href: "/scent-finder", label: "Fai il quiz" },
  },
  {
    id: "layering",
    keywords: ["layering", "combinare due profumi", "abbinare fragranze", "duo set", "scent harmony"],
    answer: "Nel Layering Lab puoi scegliere due fragranze Lynux e scoprire il loro Scent Harmony Score, oltre alla piramide olfattiva combinata. Se ti convince, puoi acquistare le due fragranze insieme come Duo Set con uno sconto.",
    link: { href: "/custom-blend", label: "Apri il Layering Lab" },
  },
  {
    id: "currency",
    keywords: ["valuta", "dollari", "sterline", "cambiare prezzo", "prezzo in euro"],
    answer: "Puoi cambiare la valuta mostrata (EUR, USD o GBP) dal selettore nell'header — tutti i prezzi del sito si aggiornano automaticamente.",
  },
  {
    id: "quick-view",
    keywords: ["anteprima rapida", "quick view", "vedere il profumo senza aprire la pagina"],
    answer: "Dalle card del catalogo puoi cliccare l'icona a forma di occhio per aprire un'Anteprima Olfattiva rapida — piramide, formati e aggiunta al carrello senza cambiare pagina.",
    link: { href: "/catalog", label: "Vai al catalogo" },
  },
  {
    id: "greeting",
    keywords: ["ciao", "salve", "buongiorno", "buonasera", "aiuto", "help"],
    answer: "Ciao! Sono il concierge digitale di Lynux Profumi. Posso aiutarti a scegliere una fragranza, spiegarti spedizioni e pagamenti, o guidarti nel tracciamento di un ordine. Cosa ti serve?",
  },
];

function matchFaq(message: string): FaqEntry | null {
  const normalizedMessage = normalize(message);
  let best: { entry: FaqEntry; score: number } | null = null;

  for (const entry of FAQ) {
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

const FALLBACK_REPLY: AssistantReply = {
  text: "Non sono sicuro di aver capito. Posso aiutarti con: consigli sulle fragranze, note olfattive e prezzi, spedizioni e pagamenti, oppure tracciamento ordine. Prova a riformulare, oppure esplora il catalogo.",
  link: { href: "/catalog", label: "Esplora il catalogo" },
};

export function getLocalResponse(message: string): AssistantReply {
  const family = matchFamily(message);
  const product = matchProduct(message);

  if (product) {
    return { text: describeProduct(product), link: { href: `/product/${product.slug}`, label: `Vedi ${product.name}` } };
  }

  if (family) {
    const matches = products.filter((candidate) => candidate.family === family);
    const list = matches
      .map((candidate) => `${candidate.name} (${formatMoney(candidate.sizes[1].price, "EUR")} · ${candidate.tagline})`)
      .join(", ");
    return {
      text: `Nella famiglia ${family} abbiamo: ${list}.`,
      link: { href: `/catalog?family=${encodeURIComponent(family)}`, label: `Vedi i ${family.toLowerCase()}` },
    };
  }

  const faq = matchFaq(message);
  if (faq) return { text: faq.answer, link: faq.link };

  return FALLBACK_REPLY;
}
