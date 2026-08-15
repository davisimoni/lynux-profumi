"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, size = "sm" }: StarRatingProps) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = Boolean(onChange);
  const displayValue = hovered ?? value;
  const starSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => interactive && setHovered(null)}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? t.reviews.ratingAria : t.reviews.starsAria(value)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          aria-label={t.reviews.starsAria(star)}
          className={cn(interactive && "cursor-pointer")}
        >
          <Star
            className={cn(
              starSize,
              star <= displayValue ? "fill-gold text-gold" : "fill-transparent text-border",
            )}
          />
        </button>
      ))}
    </div>
  );
}
