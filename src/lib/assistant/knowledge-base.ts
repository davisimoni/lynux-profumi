import { products } from "@/data/products";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST, VAT_RATE } from "@/lib/constants";
import { formatMoney } from "@/lib/currency";
import type { Product } from "@/types/product";

/**
 * The site's full knowledge, in one place — consumed two ways:
 *  - as the system-prompt grounding for the real Claude-backed assistant
 *    (`ANTHROPIC_API_KEY` configured), so it never has to guess a price;
 *  - as the corpus the local fallback responder searches with Fuse.js when
 *    no key is configured (the path that actually runs in this demo).
 * Both paths answer from the same source of truth, so the "trained on the
 * whole e-commerce" claim holds regardless of which path is active.
 */

export function describeProduct(product: Product): string {
  const sizes = product.sizes.map((size) => `${size.label} a ${formatMoney(size.price, "EUR")}`).join(", ");
  return [
    `${product.name} (${product.family}, ${product.gender}, ${product.concentration})`,
    `Slogan: "${product.tagline}".`,
    `Descrizione: ${product.description}`,
    `Note di testa: ${product.notes.top.join(", ")}. Note di cuore: ${product.notes.heart.join(", ")}. Note di fondo: ${product.notes.base.join(", ")}.`,
    `Scia: ${product.sillage}/5. Durata: ${product.longevity}/5.`,
    `Formati e prezzi: ${sizes}.`,
    product.bestseller ? "È uno dei bestseller Lynux." : "",
    product.isNew ? "È una new entry della collezione." : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildKnowledgeBaseText(): string {
  const catalogue = products.map((product) => `- ${describeProduct(product)}`).join("\n");

  return `Sei il concierge digitale di Lynux Profumi, un e-commerce di profumeria di nicchia di lusso. Rispondi in italiano, con tono elegante, cordiale e diretto (dai del "tu" a chi scrive, come fa tutto il sito). Rispondi solo usando le informazioni qui sotto: se non sai qualcosa, invita a contattare l'assistenza invece di inventare.

CATALOGO (6 fragranze):
${catalogue}

SPEDIZIONE E PAGAMENTO:
- Spedizione gratuita sopra ${formatMoney(FREE_SHIPPING_THRESHOLD, "EUR")} di spesa, altrimenti ${formatMoney(STANDARD_SHIPPING_COST, "EUR")}.
- I prezzi mostrati includono l'IVA (${Math.round(VAT_RATE * 100)}%).
- Pagamento con carta di credito (via Stripe, in modalità test in questa demo — usa la carta 4242 4242 4242 4242), oppure Apple Pay/PayPal simulati.
- Il sito converte i prezzi in EUR, USD o GBP tramite il selettore valuta nell'header.

FUNZIONALITÀ DEL SITO:
- Catalogo con filtri per famiglia olfattiva, genere e concentrazione: /catalog
- Scent Finder Quiz: tre domande per ricevere una raccomandazione di fragranza: /scent-finder
- Layering Lab: permette di combinare due fragranze e vedere uno "Scent Harmony Score", con possibilità di acquistare un Duo Set scontato: /custom-blend
- Quick View: dalle card prodotto si può aprire un'anteprima rapida col pulsante con l'icona occhio, senza cambiare pagina.
- Tracciamento ordine: dopo l'acquisto si riceve un codice ordine (formato LYNUX-AAAAMMGG-XXXX-XXXXXXXX) da inserire su /track-order per seguire lo stato di spedizione in tempo reale.
- Durante il checkout lo stock del carrello viene riservato per 10 minuti (mostrato da un piccolo timer "Riservato per te"), per garantire la disponibilità mentre si completa l'ordine.
- Atmosfera del sito: si può passare tra "Nuit" (tema scuro, default) e "Jour" (tema chiaro) da un interruttore nell'header.
- Le recensioni verificate (con voto, scia e durata) sono visibili in fondo a ogni pagina prodotto, dove si può anche lasciarne una.

NOTE IMPORTANTI:
- Questo è un progetto demo di portfolio: ordini e pagamenti (quando Stripe non è configurato) sono simulati, nessun addebito reale avviene.
- Se ti chiedono qualcosa che esula da Lynux Profumi (es. domande generiche non legate al sito), rispondi gentilmente che puoi aiutare solo con Lynux Profumi.`;
}
