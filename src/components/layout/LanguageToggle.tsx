"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { Locale } from "@/lib/i18n/dictionary";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "it", label: "IT" },
  { value: "en", label: "EN" },
];

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div
      className={cn(
        "relative flex items-center rounded-full border border-border bg-obsidian-raised p-0.5",
        className,
      )}
      role="radiogroup"
      aria-label={t.nav.language}
    >
      <Languages className="ml-2 mr-0.5 h-3 w-3 text-muted-foreground" />
      {OPTIONS.map((option) => {
        const isActive = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setLocale(option.value)}
            className={cn(
              "relative z-10 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wide transition-colors cursor-pointer",
              isActive ? "text-obsidian" : "text-muted-foreground hover:text-cream",
            )}
          >
            {option.label}
            {isActive && (
              <motion.span
                layoutId="language-pill"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 -z-10 rounded-full bg-gold"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
