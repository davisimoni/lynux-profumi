import type { OlfactoryFamily, OlfactoryNotes, Product } from "@/types/product";
import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * Symmetric compatibility base-score (0-100) between two olfactory families,
 * modelled on classic perfumery pairing conventions (e.g. woods+ambers are
 * a near-perfect match, citrus+oriental is a bolder, riskier contrast).
 */
const FAMILY_COMPATIBILITY: Record<OlfactoryFamily, Record<OlfactoryFamily, number>> = {
  Legnosi: { Legnosi: 82, Speziati: 88, Orientali: 91, Agrumati: 78, Ambrati: 93 },
  Speziati: { Legnosi: 88, Speziati: 75, Orientali: 90, Agrumati: 85, Ambrati: 87 },
  Orientali: { Legnosi: 91, Speziati: 90, Orientali: 80, Agrumati: 72, Ambrati: 89 },
  Agrumati: { Legnosi: 78, Speziati: 85, Orientali: 72, Agrumati: 85, Ambrati: 74 },
  Ambrati: { Legnosi: 93, Speziati: 87, Orientali: 89, Agrumati: 74, Ambrati: 79 },
};

export interface HarmonyResult {
  score: number;
  label: string;
  narrative: string;
}

function sharedNoteBonus(a: Product, b: Product): number {
  const notesA = new Set([...a.notes.top, ...a.notes.heart, ...a.notes.base]);
  const notesB = new Set([...b.notes.top, ...b.notes.heart, ...b.notes.base]);
  let shared = 0;
  for (const note of notesA) {
    if (notesB.has(note)) shared += 1;
  }
  return Math.min(6, shared * 2);
}

export function computeHarmony(a: Product, b: Product, t: Dictionary): HarmonyResult {
  const base = FAMILY_COMPATIBILITY[a.family][b.family];
  const bonus = a.id === b.id ? 0 : sharedNoteBonus(a, b);
  const score = Math.max(0, Math.min(100, Math.round(base + bonus)));
  const bands = t.blend.harmonyBands;
  const band = bands.find((entry) => score >= entry.min) ?? bands[bands.length - 1];

  return { score, label: band.label, narrative: band.narrative };
}

export function mergeNotes(a: Product, b: Product): OlfactoryNotes {
  const dedupe = (values: string[]) => Array.from(new Set(values));
  return {
    top: dedupe([...a.notes.top, ...b.notes.top]),
    heart: dedupe([...a.notes.heart, ...b.notes.heart]),
    base: dedupe([...a.notes.base, ...b.notes.base]),
  };
}
