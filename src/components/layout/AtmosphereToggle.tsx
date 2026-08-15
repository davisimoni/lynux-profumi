"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/use-has-mounted";

const OPTIONS = [
  { value: "nuit", label: "Nuit", icon: Moon },
  { value: "jour", label: "Jour", icon: Sun },
] as const;

interface AtmosphereToggleProps {
  className?: string;
}

export function AtmosphereToggle({ className }: AtmosphereToggleProps) {
  const mounted = useHasMounted();
  const { theme, setTheme } = useTheme();
  const active = mounted ? (theme ?? "nuit") : "nuit";

  return (
    <div
      className={cn(
        "relative flex items-center rounded-full border border-border bg-obsidian-raised p-0.5",
        className,
      )}
      role="radiogroup"
      aria-label="Atmosfera del sito"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = active === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(option.value)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wide transition-colors cursor-pointer",
              isActive ? "text-obsidian" : "text-muted-foreground hover:text-cream",
            )}
          >
            <Icon className="h-3 w-3" />
            {option.label}
            {isActive && (
              <motion.span
                layoutId="atmosphere-pill"
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
