"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, Search, ShoppingBag, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { AtmosphereToggle } from "@/components/layout/AtmosphereToggle";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { ProductArt } from "@/components/product/ProductArt";
import { products, olfactoryFamilies } from "@/data/products";
import { useCartStore, cartItemCount } from "@/store/cart";
import { useCommandPaletteStore } from "@/store/command-palette";
import { useHasMounted } from "@/hooks/use-has-mounted";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/scent-finder", label: "Scent Finder" },
  { href: "/custom-blend", label: "Layering Lab" },
];

export function Header() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const openCommandPalette = useCommandPaletteStore((state) => state.open);
  const mounted = useHasMounted();
  const count = mounted ? cartItemCount(items) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-obsidian/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-2xl tracking-luxe text-cream transition-colors hover:text-gold"
        >
          LYNUX
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <MegaMenu />
          {NAV_LINKS.filter((link) => link.href !== "/").map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs uppercase tracking-luxe transition-colors whitespace-nowrap",
                  active ? "text-gold" : "text-muted-foreground hover:text-cream",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Apri la ricerca"
            className="hidden items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-gold cursor-pointer sm:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Cerca</span>
            <kbd className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground/80">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Apri la ricerca"
            className="flex h-10 w-10 items-center justify-center rounded-sm text-cream transition-colors hover:text-gold cursor-pointer sm:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            <AtmosphereToggle />
            <CurrencySelector />
          </div>

          <button
            type="button"
            id="header-cart-icon"
            onClick={toggleCart}
            aria-label="Apri il carrello"
            className="relative flex h-10 w-10 items-center justify-center rounded-sm text-cream transition-colors hover:text-gold cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-obsidian"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <Sheet>
            <SheetTrigger
              aria-label="Apri il menu"
              className="flex h-10 w-10 items-center justify-center rounded-sm text-cream transition-colors hover:text-gold lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-border bg-obsidian-raised sm:max-w-sm overflow-y-auto"
            >
              <SheetTitle className="px-4 pt-4 font-display text-xl tracking-luxe text-cream">
                LYNUX
              </SheetTitle>

              <nav className="mt-4 flex flex-col gap-1 px-4">
                <Link
                  href="/"
                  className="rounded-sm px-3 py-3 text-sm uppercase tracking-wide text-cream transition-colors hover:bg-secondary hover:text-gold"
                >
                  Home
                </Link>
              </nav>

              <div className="mt-2 px-4">
                <Accordion className="w-full">
                  <AccordionItem value="fragranze">
                    <AccordionTrigger className="text-xs uppercase tracking-luxe text-gold hover:no-underline">
                      Le Fragranze
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-3 pt-1">
                        {products.map((product) => (
                          <Link key={product.id} href={`/product/${product.slug}`} className="flex flex-col gap-1.5">
                            <div className="aspect-square overflow-hidden rounded-sm border border-border bg-obsidian">
                              <ProductArt
                                accent={product.accent}
                                accentSoft={product.accentSoft}
                                variant="bottle"
                              />
                            </div>
                            <p className="truncate text-[11px] text-cream">{product.name}</p>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/catalog"
                        className="mt-3 flex items-center gap-1.5 text-xs uppercase tracking-wide text-gold"
                      >
                        Vedi tutte
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="famiglie">
                    <AccordionTrigger className="text-xs uppercase tracking-luxe text-gold hover:no-underline">
                      Famiglie Olfattive
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1 pt-1">
                        {olfactoryFamilies.map((family) => (
                          <Link
                            key={family}
                            href={`/catalog?family=${encodeURIComponent(family)}`}
                            className="rounded-sm px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-cream"
                          >
                            {family}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="esperienze">
                    <AccordionTrigger className="text-xs uppercase tracking-luxe text-gold hover:no-underline">
                      Esperienze
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1 pt-1">
                        <Link
                          href="/scent-finder"
                          className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-cream"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-gold" />
                          Scent Finder Quiz
                        </Link>
                        <Link
                          href="/custom-blend"
                          className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-cream"
                        >
                          <Wand2 className="h-3.5 w-3.5 text-gold" />
                          Layering Lab
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <nav className="mt-2 flex flex-col gap-1 px-4">
                <Link
                  href="/track-order"
                  className="rounded-sm px-3 py-3 text-sm uppercase tracking-wide text-cream transition-colors hover:bg-secondary hover:text-gold"
                >
                  Traccia Ordine
                </Link>
              </nav>

              <div className="mt-4 flex items-center justify-between px-4">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Atmosfera
                </span>
                <AtmosphereToggle />
              </div>

              <div className="mt-3 flex items-center justify-between px-4 pb-6">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Valuta
                </span>
                <CurrencySelector />
              </div>

              <div className="flex items-center gap-2 px-4 pb-6 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-gold" />
                Essence of Unseen Luxury
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
