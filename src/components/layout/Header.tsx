"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, ShoppingBag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { AtmosphereToggle } from "@/components/layout/AtmosphereToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useCartStore, cartItemCount } from "@/store/cart";
import { useCommandPaletteStore } from "@/store/command-palette";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useTranslation } from "@/hooks/use-translation";

export function Header() {
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const openCommandPalette = useCommandPaletteStore((state) => state.open);
  const mounted = useHasMounted();
  const count = mounted ? cartItemCount(items) : 0;
  const { t } = useTranslation();

  const NAV_LINKS = [
    { href: "/", label: t.nav.home },
    { href: "/catalog", label: t.nav.catalog },
    { href: "/scent-finder", label: t.nav.scentFinder },
    { href: "/custom-blend", label: t.nav.layeringLab },
    { href: "/sample-discovery", label: t.nav.discoverySet },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-obsidian/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-luxe text-cream transition-colors hover:text-gold"
        >
          LYNUX
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
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
            aria-label={t.nav.searchAria}
            title={t.nav.searchAria}
            className="flex h-10 w-10 items-center justify-center rounded-sm text-cream transition-colors hover:text-gold cursor-pointer"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            <AtmosphereToggle />
            <LanguageToggle />
            <CurrencySelector />
          </div>

          <button
            type="button"
            id="header-cart-icon"
            onClick={toggleCart}
            aria-label={t.nav.cartAria}
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
              aria-label={t.nav.menuAria}
              className="flex h-10 w-10 items-center justify-center rounded-sm text-cream transition-colors hover:text-gold lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-border bg-obsidian-raised sm:max-w-sm overflow-y-auto"
            >
              <SheetTitle className="px-4 pt-4 font-display text-xl font-semibold tracking-luxe text-cream">
                LYNUX
              </SheetTitle>

              <nav className="mt-4 flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-sm px-3 py-3 text-sm uppercase tracking-wide text-cream transition-colors hover:bg-secondary hover:text-gold"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/track-order"
                  className="rounded-sm px-3 py-3 text-sm uppercase tracking-wide text-cream transition-colors hover:bg-secondary hover:text-gold"
                >
                  {t.nav.trackOrder}
                </Link>
              </nav>

              <div className="mt-4 flex items-center justify-between px-4">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t.nav.atmosphere}
                </span>
                <AtmosphereToggle />
              </div>

              <div className="mt-3 flex items-center justify-between px-4">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t.nav.language}
                </span>
                <LanguageToggle />
              </div>

              <div className="mt-3 flex items-center justify-between px-4 pb-6">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t.nav.currency}
                </span>
                <CurrencySelector />
              </div>

              <div className="flex items-center gap-2 px-4 pb-6 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-gold" />
                {t.nav.tagline}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
