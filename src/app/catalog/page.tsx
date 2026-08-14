import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog/CatalogClient";

export const metadata: Metadata = {
  title: "Catalogo Fragranze | Lynux Profumi",
  description:
    "Esplora la collezione completa di Lynux Profumi: fragranze legnose, speziate, orientali, agrumate e ambrate in Extrait de Parfum ed Eau de Parfum.",
};

export default function CatalogPage() {
  return <CatalogClient />;
}
