"use client";

import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useCurrencyStore } from "@/store/currency";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { telemetry } from "@/lib/telemetry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencySelector() {
  const mounted = useHasMounted();
  const currency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const effectiveCurrency = mounted ? currency : "EUR";

  return (
    <Select
      value={effectiveCurrency}
      onValueChange={(value) => {
        const next = value as CurrencyCode;
        telemetry.info("currency.changed", `Valuta cambiata da ${currency} a ${next}`, {
          from: currency,
          to: next,
        });
        setCurrency(next);
      }}
    >
      <SelectTrigger
        aria-label="Seleziona valuta"
        className="h-9 w-[74px] border-border bg-transparent px-2 text-xs uppercase tracking-wide text-cream"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((meta) => (
          <SelectItem key={meta.code} value={meta.code}>
            {meta.symbol} {meta.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
