import { cn } from "@/lib/utils";

interface ScentMeterProps {
  label: string;
  value: number;
  descriptor?: string;
}

export function ScentMeter({ label, value, descriptor }: ScentMeterProps) {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={cn("h-1.5 w-5 rounded-full", dot <= rounded ? "bg-gold" : "bg-border")}
          />
        ))}
      </div>
      {descriptor && <span className="text-xs text-muted-foreground">{descriptor}</span>}
    </div>
  );
}
