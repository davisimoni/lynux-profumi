"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useTranslation } from "@/hooks/use-translation";

interface AtmosphereToggleProps {
  className?: string;
}

export function AtmosphereToggle({ className }: AtmosphereToggleProps) {
  const mounted = useHasMounted();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const active = mounted ? (theme ?? "nuit") : "nuit";
  const isDark = active === "nuit";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "jour" : "nuit")}
      aria-label={isDark ? t.nav.switchToLight : t.nav.switchToDark}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-sm text-cream transition-colors hover:text-gold cursor-pointer",
        className,
      )}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
