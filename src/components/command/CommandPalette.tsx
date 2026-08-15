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
import { useTranslation } from "@/hooks/use-translation";

const TYPE_ICON: Record<SearchItemType, typeof Package> = {
  product: Package,
  note: Droplet,
  family: Layers,
  page: ArrowRight,
};

const TYPE_ORDER: SearchItemType[] = ["product", "family", "note", "page"];
const GROUP_LIMIT: Record<SearchItemType, number> = { product: 6, family: 5, note: 6, page: 6 };

export function CommandPalette() {
  const router = useRouter();
  const isOpen = useCommandPaletteStore((state) => state.isOpen);
  const close = useCommandPaletteStore((state) => state.close);
  const [query, setQuery] = useState("");
  const { locale, t } = useTranslation();

  const TYPE_HEADING: Record<SearchItemType, string> = t.commandPalette.groupHeadings;

  const searchIndex = useMemo(() => buildSearchIndex(t, locale), [t, locale]);

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: [
          { name: "title", weight: 0.7 },
          { name: "subtitle", weight: 0.3 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [searchIndex],
  );

  const defaultResults = useMemo<SearchItem[]>(
    () => [
      ...products
        .filter((product) => product.bestseller)
        .map(
          (product): SearchItem => ({
            type: "product",
            id: `product-${product.id}`,
            title: product.name,
            subtitle: `${t.families[product.family]} · ${t.concentrations[product.concentration]}`,
            href: `/product/${product.slug}`,
            accent: product.accent,
          }),
        ),
      ...searchIndex.filter((item) => item.type === "page"),
    ],
    [searchIndex, t],
  );

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
    if (trimmed.length === 0) return defaultResults;
    return fuse
      .search(trimmed)
      .map((match) => match.item)
      .slice(0, 30);
  }, [query, fuse, defaultResults]);

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
      title={t.commandPalette.title}
      description={t.commandPalette.description}
      className="border border-border bg-obsidian-raised"
    >
      <Command shouldFilter={false} className="bg-transparent">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={t.commandPalette.placeholder}
        />
        <CommandList>
          <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
            {t.commandPalette.noResults(query)}
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
          <span>{t.commandPalette.navigate}</span>
          <span>{t.commandPalette.select}</span>
          <span>{t.commandPalette.close}</span>
        </div>
      </Command>
    </CommandDialog>
  );
}
