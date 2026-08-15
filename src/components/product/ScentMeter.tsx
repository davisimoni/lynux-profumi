import { cn } from "@/lib/utils";

interface ScentMeterProps {
  label: string;
  value: number;
  descriptor?: string;
  compact?: boolean;
}

export function ScentMeter({ label, value, descriptor, compact = false }: ScentMeterProps) {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "shrink-0 uppercase tracking-wide text-muted-foreground",
          compact ? "w-14 text-[10px]" : "w-20 text-xs",
        )}
      >
        {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={cn(
              "rounded-full",
              compact ? "h-1 w-3.5" : "h-1.5 w-5",
              dot <= rounded ? "bg-gold" : "bg-border",
            )}
          />
        ))}
      </div>
      {descriptor && <span className="text-xs text-muted-foreground">{descriptor}</span>}
    </div>
  );
}
