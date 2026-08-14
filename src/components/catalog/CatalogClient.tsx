"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { products, olfactoryFamilies, genders, concentrations } from "@/data/products";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type SortOption = "popularity" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  popularity: "Popolarità",
  "price-asc": "Prezzo: crescente",
  "price-desc": "Prezzo: decrescente",
};

function toggleValue<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function referencePrice(product: Product): number {
  return product.sizes[1]?.price ?? product.sizes[0].price;
}

interface FilterGroupsProps {
  families: Set<Product["family"]>;
  selectedGenders: Set<Product["gender"]>;
  selectedConcentrations: Set<Product["concentration"]>;
  onToggleFamily: (value: Product["family"]) => void;
  onToggleGender: (value: Product["gender"]) => void;
  onToggleConcentration: (value: Product["concentration"]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

function FilterGroups({
  families,
  selectedGenders,
  selectedConcentrations,
  onToggleFamily,
  onToggleGender,
  onToggleConcentration,
  onReset,
  hasActiveFilters,
}: FilterGroupsProps) {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-luxe text-gold">Famiglia Olfattiva</p>
        </div>
        <div className="space-y-2.5">
          {olfactoryFamilies.map((family) => (
            <label
              key={family}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground hover:text-cream"
            >
              <Checkbox
                checked={families.has(family)}
                onCheckedChange={() => onToggleFamily(family)}
              />
              {family}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-luxe text-gold">Genere</p>
        <div className="space-y-2.5">
          {genders.map((gender) => (
            <label
              key={gender}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground hover:text-cream"
            >
              <Checkbox
                checked={selectedGenders.has(gender)}
                onCheckedChange={() => onToggleGender(gender)}
              />
              {gender}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-luxe text-gold">Concentrazione</p>
        <div className="space-y-2.5">
          {concentrations.map((concentration) => (
            <label
              key={concentration}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground hover:text-cream"
            >
              <Checkbox
                checked={selectedConcentrations.has(concentration)}
                onCheckedChange={() => onToggleConcentration(concentration)}
              />
              {concentration}
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs uppercase tracking-wide text-muted-foreground underline underline-offset-4 hover:text-gold cursor-pointer"
        >
          Azzera filtri
        </button>
      )}
    </div>
  );
}

export function CatalogClient() {
  const [families, setFamilies] = useState<Set<Product["family"]>>(new Set());
  const [selectedGenders, setSelectedGenders] = useState<Set<Product["gender"]>>(new Set());
  const [selectedConcentrations, setSelectedConcentrations] = useState<
    Set<Product["concentration"]>
  >(new Set());
  const [sort, setSort] = useState<SortOption>("popularity");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    // Deep-link support (e.g. command palette "family" results): the static
    // shell always renders unfiltered, so the ?family= param is applied
    // after mount rather than via a lazy initializer, which would diverge
    // from the prerendered HTML on a hard page load and break hydration.
    const params = new URLSearchParams(window.location.search);
    const family = params.get("family");
    if (family && (olfactoryFamilies as string[]).includes(family)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFamilies(new Set([family as Product["family"]]));
    }
  }, []);

  const hasActiveFilters =
    families.size > 0 || selectedGenders.size > 0 || selectedConcentrations.size > 0;

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      if (families.size > 0 && !families.has(product.family)) return false;
      if (selectedGenders.size > 0 && !selectedGenders.has(product.gender)) return false;
      if (
        selectedConcentrations.size > 0 &&
        !selectedConcentrations.has(product.concentration)
      )
        return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "price-asc") return referencePrice(a) - referencePrice(b);
      if (sort === "price-desc") return referencePrice(b) - referencePrice(a);
      return b.popularity - a.popularity;
    });
  }, [families, selectedGenders, selectedConcentrations, sort]);

  const filterProps: FilterGroupsProps = {
    families,
    selectedGenders,
    selectedConcentrations,
    onToggleFamily: (value) => setFamilies((prev) => toggleValue(prev, value)),
    onToggleGender: (value) => setSelectedGenders((prev) => toggleValue(prev, value)),
    onToggleConcentration: (value) =>
      setSelectedConcentrations((prev) => toggleValue(prev, value)),
    onReset: () => {
      setFamilies(new Set());
      setSelectedGenders(new Set());
      setSelectedConcentrations(new Set());
    },
    hasActiveFilters,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-3 border-b border-border pb-8 text-center">
        <p className="text-xs uppercase tracking-luxe text-gold">La Collezione</p>
        <h1 className="font-display text-4xl font-light text-cream">Catalogo Fragranze</h1>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="hidden w-56 shrink-0 lg:block">
          <FilterGroups {...filterProps} />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "fragranza" : "fragranze"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs uppercase tracking-wide text-cream hover:border-gold hover:text-gold lg:hidden cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtri
              </button>

              <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
                <SelectTrigger className="w-[190px] border-border bg-transparent text-xs uppercase tracking-wide text-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                    <SelectItem key={option} value={option}>
                      {SORT_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-24 text-center">
              <p className="text-cream">Nessuna fragranza corrisponde ai filtri selezionati.</p>
              <button
                type="button"
                onClick={filterProps.onReset}
                className="text-xs uppercase tracking-wide text-gold underline underline-offset-4 cursor-pointer"
              >
                Azzera filtri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="border-border bg-obsidian-raised">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="font-display text-lg text-cream">Filtri</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <FilterGroups {...filterProps} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
