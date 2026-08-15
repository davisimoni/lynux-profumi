"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Wand2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { products, olfactoryFamilies } from "@/data/products";
import { ProductArt } from "@/components/product/ProductArt";

const EXPERIENCES = [
  {
    href: "/scent-finder",
    label: "Scent Finder Quiz",
    description: "Tre domande per trovare la tua fragranza ideale.",
    icon: Sparkles,
  },
  {
    href: "/custom-blend",
    label: "Layering Lab",
    description: "Combina due fragranze in un Duo Set su misura.",
    icon: Wand2,
  },
];

const OPEN_DELAY = 80;
const CLOSE_DELAY = 200;

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPendingTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function handleEnter() {
    clearPendingTimeout();
    timeoutRef.current = setTimeout(() => setOpen(true), OPEN_DELAY);
  }

  function handleLeave() {
    clearPendingTimeout();
    timeoutRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => clearPendingTimeout, []);

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href="/catalog"
        className={cn(
          "flex items-center gap-1 text-xs uppercase tracking-luxe transition-colors whitespace-nowrap",
          open ? "text-gold" : "text-muted-foreground hover:text-cream",
        )}
        aria-expanded={open}
      >
        Fragranze
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-16 z-30"
          >
            <div
              onClick={() => setOpen(false)}
              className="glass-panel mx-auto max-w-7xl rounded-b-md px-8 py-10 shadow-2xl"
            >
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">
                <div>
                  <p className="mb-4 text-[11px] uppercase tracking-luxe text-gold">
                    Le Fragranze
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group flex flex-col gap-2"
                      >
                        <div className="aspect-square overflow-hidden rounded-sm border border-border bg-obsidian transition-colors group-hover:border-gold/60">
                          <ProductArt
                            accent={product.accent}
                            accentSoft={product.accentSoft}
                            variant="bottle"
                          />
                        </div>
                        <div>
                          <p className="font-display text-sm text-cream group-hover:text-gold">
                            {product.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {product.notes.top[0]}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-4 text-[11px] uppercase tracking-luxe text-gold">
                    Famiglie Olfattive
                  </p>
                  <nav className="flex flex-col gap-3">
                    {olfactoryFamilies.map((family) => (
                      <Link
                        key={family}
                        href={`/catalog?family=${encodeURIComponent(family)}`}
                        className="group flex items-center justify-between text-sm text-muted-foreground transition-colors hover:text-gold"
                      >
                        {family}
                        <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </nav>
                </div>

                <div>
                  <p className="mb-4 text-[11px] uppercase tracking-luxe text-gold">Esperienze</p>
                  <div className="flex flex-col gap-4">
                    {EXPERIENCES.map((experience) => {
                      const Icon = experience.icon;
                      return (
                        <Link
                          key={experience.href}
                          href={experience.href}
                          className="group flex items-start gap-3"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span>
                            <span className="block text-sm text-cream group-hover:text-gold">
                              {experience.label}
                            </span>
                            <span className="block text-[11px] text-muted-foreground">
                              {experience.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
