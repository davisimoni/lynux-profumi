"use client";

const RADIUS = 62;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface HarmonyGaugeProps {
  score: number;
  label: string;
}

export function HarmonyGauge({ score, label }: HarmonyGaugeProps) {
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl text-gold">{score}%</span>
          <span className="text-[10px] uppercase tracking-luxe text-muted-foreground">
            Harmony Score
          </span>
        </div>
      </div>
      <p className="font-display text-lg text-cream">{label}</p>
    </div>
  );
}
