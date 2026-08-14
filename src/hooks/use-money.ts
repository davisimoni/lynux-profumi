"use client";

import { useCallback } from "react";
import { formatMoney } from "@/lib/currency";
import { useCurrencyStore } from "@/store/currency";
import { useHasMounted } from "@/hooks/use-has-mounted";

export function useMoney() {
  const mounted = useHasMounted();
  const currency = useCurrencyStore((state) => state.currency);
  const effectiveCurrency = mounted ? currency : "EUR";

  return useCallback(
    (amountEur: number) => formatMoney(amountEur, effectiveCurrency),
    [effectiveCurrency],
  );
}
