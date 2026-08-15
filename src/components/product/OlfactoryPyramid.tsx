"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { OlfactoryNotes } from "@/types/product";
import { useTranslation } from "@/hooks/use-translation";

interface Tier {
  key: keyof OlfactoryNotes;
  label: string;
  subtitle: string;
  widthClass: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const tierVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const chipContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const chipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

interface OlfactoryPyramidProps {
  notes: OlfactoryNotes;
}

export function OlfactoryPyramid({ notes }: OlfactoryPyramidProps) {
  const { t } = useTranslation();
  const TIERS: Tier[] = [
    { key: "top", label: t.product.pyramid.tiers.top.label, subtitle: t.product.pyramid.tiers.top.subtitle, widthClass: "w-[46%]" },
    { key: "heart", label: t.product.pyramid.tiers.heart.label, subtitle: t.product.pyramid.tiers.heart.subtitle, widthClass: "w-[72%]" },
    { key: "base", label: t.product.pyramid.tiers.base.label, subtitle: t.product.pyramid.tiers.base.subtitle, widthClass: "w-[98%]" },
  ];
  const [selected, setSelected] = useState<Tier["key"]>("heart");
  const activeTier = TIERS.find((tier) => tier.key === selected) ?? TIERS[1];

  return (
    <div className="rounded-md border border-border bg-card p-6 sm:p-8">
      <p className="mb-6 text-xs uppercase tracking-luxe text-gold">
        {t.product.pyramid.title}
      </p>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={containerVariants}
        className="flex flex-col items-center gap-2.5"
      >
        {TIERS.map((tier) => {
          const isActive = tier.key === selected;
          return (
            <motion.button
              key={tier.key}
              type="button"
              variants={tierVariants}
              onClick={() => setSelected(tier.key)}
              className={cn(
                tier.widthClass,
                "flex h-14 items-center justify-center rounded-sm border text-center transition-colors duration-300 cursor-pointer",
                isActive
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/40 hover:text-cream",
              )}
            >
              <span className="text-xs uppercase tracking-luxe sm:text-sm">{tier.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="mt-8 border-t border-border pt-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-display text-lg text-cream">{activeTier.label}</p>
            <p className="text-xs text-muted-foreground">{activeTier.subtitle}</p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={chipContainerVariants}
              className="mt-4 flex flex-wrap justify-center gap-2"
            >
              {notes[selected].map((note) => (
                <motion.span
                  key={note}
                  variants={chipVariants}
                  className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-cream"
                >
                  {note}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
