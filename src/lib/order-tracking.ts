export interface TrackingStage {
  key: string;
  label: string;
  description: string;
}

export const TRACKING_STAGES: TrackingStage[] = [
  {
    key: "received",
    label: "Ordine Ricevuto",
    description: "Il tuo ordine è stato confermato e registrato nel nostro atelier.",
  },
  {
    key: "preparing",
    label: "In Preparazione",
    description: "Stiamo preparando con cura la tua fragranza per l'imbottigliamento.",
  },
  {
    key: "packed",
    label: "Confezionato",
    description: "Il tuo ordine è stato sigillato nella confezione luxury gift box.",
  },
  {
    key: "shipped",
    label: "Spedito",
    description: "Il corriere ha ritirato il pacco ed è in transito verso di te.",
  },
  {
    key: "out-for-delivery",
    label: "In Consegna",
    description: "Il tuo ordine è in viaggio verso l'indirizzo di spedizione indicato.",
  },
  {
    key: "delivered",
    label: "Consegnato",
    description: "Il tuo ordine è stato consegnato. Buona scoperta olfattiva.",
  },
];

/** Demo pacing: each stage advances after this many seconds of elapsed time. */
export const STAGE_INTERVAL_SECONDS = 35;

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministic pseudo-elapsed baseline (seconds) for an order code with no
 * matching local order — same code always yields the same starting point,
 * spread across the full stage range so most lookups land mid-journey.
 */
export function baselineElapsedSeconds(code: string): number {
  const span = STAGE_INTERVAL_SECONDS * (TRACKING_STAGES.length - 1) + 25;
  return hashCode(code.trim().toUpperCase()) % span;
}

export function computeStageIndex(elapsedSeconds: number): number {
  return Math.min(
    TRACKING_STAGES.length - 1,
    Math.floor(elapsedSeconds / STAGE_INTERVAL_SECONDS),
  );
}

export function estimatedStageDate(orderDate: Date, stageIndex: number): Date {
  return new Date(orderDate.getTime() + stageIndex * STAGE_INTERVAL_SECONDS * 1000);
}
