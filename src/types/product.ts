export type OlfactoryFamily =
  | "Legnosi"
  | "Speziati"
  | "Orientali"
  | "Agrumati"
  | "Ambrati";

export type Gender = "Unisex" | "Uomo" | "Donna";

export type Concentration = "Extrait de Parfum" | "Eau de Parfum";

export interface ProductSize {
  ml: number;
  label: string;
  price: number;
}

export interface OlfactoryNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  family: OlfactoryFamily;
  gender: Gender;
  concentration: Concentration;
  notes: OlfactoryNotes;
  sizes: ProductSize[];
  bestseller?: boolean;
  isNew?: boolean;
  popularity: number;
  accent: string;
  accentSoft: string;
  stockUnits: number;
}
