"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Package, Droplet, Layers, ArrowRight } from "lucide-react";
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { buildSearchIndex, type SearchItem, type SearchItemType } from "@/lib/search-index";
import { products } from "@/data/products";
import { useCommandPaletteStore } from "@/store/command-palette";

const TYPE_ICON: Record<SearchItemType, typeof Package> = {
  product: Package,
  note: Droplet,
  family: Layers,
  page: ArrowRight,
};

const TYPE_HEADING: Record<SearchItemType, string> = {
  product: "Fragranze",
  family: "Famiglie Olfattive",
  note: "Note Olfattive",
  page: "Naviga",
};

const TYPE_ORDER: SearchItemType[] = ["product", "family", "note", "page"];
const GROUP_LIMIT: Record<SearchItemType, number> = { product: 6, family: 5, note: 6, page: 6 };

const SEARCH_INDEX = buildSearchIndex();

const fuse = new Fuse(SEARCH_INDEX, {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "subtitle", weight: 0.3 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

const DEFAULT_RESULTS: SearchItem[] = [
  ...products
    .filter((product) => product.bestseller)
    .map(
      (product): SearchItem => ({
        type: "product",
        id: `product-${product.id}`,
        title: product.name,
        subtitle: `${product.family} · ${product.concentration}`,
        href: `/product/${product.slug}`,
        accent: product.accent,
      }),
    ),
  ...SEARCH_INDEX.filter((item) => item.type === "page"),
];

export function CommandPalette() {
  const router = useRouter();
  const isOpen = useCommandPaletteStore((state) => state.isOpen);
  const close = useCommandPaletteStore((state) => state.close);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        useCommandPaletteStore.getState().toggle();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleClose() {
    close();
    setQuery("");
  }

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return DEFAULT_RESULTS;
    return fuse
      .search(trimmed)
      .map((match) => match.item)
      .slice(0, 30);
  }, [query]);

  const groups = useMemo(() => {
    const buckets = new Map<SearchItemType, SearchItem[]>();
    for (const item of results) {
      const bucket = buckets.get(item.type) ?? [];
      bucket.push(item);
      buckets.set(item.type, bucket);
    }
    return TYPE_ORDER.map((type) => ({
      type,
      items: (buckets.get(type) ?? []).slice(0, GROUP_LIMIT[type]),
    })).filter((group) => group.items.length > 0);
  }, [results]);

  function handleSelect(item: SearchItem) {
    handleClose();
    router.push(item.href);
  }

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(next) => (next ? undefined : handleClose())}
      title="Ricerca Lynux"
      description="Cerca fragranze, note olfattive, famiglie e pagine"
      className="border border-border bg-obsidian-raised"
    >
      <Command shouldFilter={false} className="bg-transparent">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Cerca una fragranza, una nota, una famiglia olfattiva…"
        />
        <CommandList>
          <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
            Nessun risultato per &ldquo;{query}&rdquo;.
          </CommandEmpty>

          {groups.map(({ type, items }) => (
            <CommandGroup key={type} heading={TYPE_HEADING[type]}>
              {items.map((item) => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <CommandItem key={item.id} value={item.id} onSelect={() => handleSelect(item)}>
                    <Icon className="h-4 w-4 shrink-0 text-gold" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-cream">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>

        <div className="flex items-center justify-end gap-4 border-t border-border px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>↑↓ Naviga</span>
          <span>↵ Seleziona</span>
          <span>Esc Chiudi</span>
        </div>
      </Command>
    </CommandDialog>
  );
}
