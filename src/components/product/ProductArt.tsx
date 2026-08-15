"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type ProductArtVariant = "bottle" | "aura" | "liquid" | "cap";

interface ProductArtProps {
  accent: string;
  accentSoft: string;
  variant?: ProductArtVariant;
  className?: string;
  /** Optional personalization engraved beneath the "LX" monogram (bottle variant only). */
  engravingText?: string;
}

export function ProductArt({
  accent,
  accentSoft,
  variant = "bottle",
  className,
  engravingText,
}: ProductArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const glowId = `glow-${uid}`;
  const bodyId = `body-${uid}`;
  const capId = `cap-${uid}`;
  const shineId = `shine-${uid}`;
  const auraId = `aura-${uid}`;
  const liquidId = `liquid-${uid}`;
  const ringId = `ring-${uid}`;

  return (
    <svg
      viewBox="0 0 400 500"
      className={cn("h-full w-full", className)}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="55%" stopColor={accentSoft} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accentSoft} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={bodyId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="45%" stopColor={accentSoft} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#050506" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={capId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0dba3" />
          <stop offset="100%" stopColor="#a67c37" />
        </linearGradient>
        <linearGradient id={shineId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={auraId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="45%" stopColor={accentSoft} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accentSoft} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={liquidId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.65" />
          <stop offset="50%" stopColor={accentSoft} stopOpacity="0.5" />
          <stop offset="100%" stopColor="#050506" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id={ringId} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor={accentSoft} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect width="400" height="500" fill="var(--obsidian)" />

      {variant === "bottle" && (
        <g>
          <ellipse cx="200" cy="210" rx="170" ry="170" fill={`url(#${glowId})`} />
          <ellipse
            cx="200"
            cy="430"
            rx="90"
            ry="16"
            fill="#000000"
            opacity="0.55"
            filter={`url(#blur-${uid})`}
          />
          <rect x="176" y="70" width="48" height="34" rx="6" fill={`url(#${capId})`} />
          <rect x="188" y="50" width="24" height="26" rx="4" fill={`url(#${capId})`} />
          <path
            d="M162 104 L238 104 L252 150 L252 400 Q252 414 238 414 L162 414 Q148 414 148 400 L148 150 Z"
            fill={`url(#${bodyId})`}
            stroke={accent}
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
          <path
            d="M178 118 L184 118 L184 396 L178 396 Z"
            fill={`url(#${shineId})`}
            opacity="0.8"
          />
          <rect
            x="168"
            y="250"
            width="64"
            height="70"
            rx="2"
            fill="none"
            stroke={accent}
            strokeOpacity="0.6"
            strokeWidth="1"
          />
          <line x1="176" y1="270" x2="224" y2="270" stroke={accent} strokeOpacity="0.5" strokeWidth="1" />
          <text
            x="200"
            y={engravingText ? "286" : "292"}
            textAnchor="middle"
            fontFamily="var(--font-display), serif"
            fontSize="18"
            letterSpacing="2"
            fill={accent}
            opacity="0.85"
          >
            LX
          </text>
          {engravingText && (
            <text
              x="200"
              y="307"
              textAnchor="middle"
              fontFamily="var(--font-display), serif"
              fontStyle="italic"
              fontSize="10"
              letterSpacing="0.5"
              fill={accent}
              opacity="0.75"
            >
              {engravingText.slice(0, 14).toUpperCase()}
            </text>
          )}
        </g>
      )}

      {variant === "aura" && (
        <g>
          <circle cx="200" cy="250" r="180" fill={`url(#${auraId})`} />
          <circle
            cx="200"
            cy="250"
            r="120"
            fill="none"
            stroke={accent}
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <circle
            cx="200"
            cy="250"
            r="90"
            fill="none"
            stroke={accent}
            strokeOpacity="0.2"
            strokeWidth="1"
          />
          <circle cx="200" cy="250" r="40" fill={accent} opacity="0.18" filter={`url(#blur-${uid})`} />
        </g>
      )}

      {variant === "liquid" && (
        <g>
          <rect width="400" height="500" fill={`url(#${liquidId})`} />
          <ellipse cx="120" cy="150" rx="140" ry="110" fill={accent} opacity="0.18" filter={`url(#blur-${uid})`} />
          <ellipse cx="300" cy="380" rx="150" ry="120" fill={accentSoft} opacity="0.35" filter={`url(#blur-${uid})`} />
          <g opacity="0.35" stroke={accent} strokeWidth="1">
            <line x1="40" y1="60" x2="360" y2="180" />
            <line x1="20" y1="140" x2="340" y2="260" />
            <line x1="60" y1="420" x2="380" y2="300" />
          </g>
        </g>
      )}

      {variant === "cap" && (
        <g>
          <circle cx="200" cy="250" r="190" fill={`url(#${ringId})`} />
          <circle cx="200" cy="250" r="130" fill="#0f0f12" stroke={accent} strokeOpacity="0.55" strokeWidth="1.5" />
          <circle cx="200" cy="250" r="112" fill="none" stroke={accent} strokeOpacity="0.3" strokeWidth="1" />
          <text
            x="200"
            y="262"
            textAnchor="middle"
            fontFamily="var(--font-display), serif"
            fontSize="42"
            letterSpacing="4"
            fill={accent}
            opacity="0.9"
          >
            LX
          </text>
        </g>
      )}
    </svg>
  );
}
