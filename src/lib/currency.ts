export type CurrencyCode = "EUR" | "USD" | "GBP";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "EUR", symbol: "€", label: "Euro", locale: "it-IT" },
  { code: "USD", symbol: "$", label: "Dollaro USA", locale: "en-US" },
  { code: "GBP", symbol: "£", label: "Sterlina", locale: "en-GB" },
];

/**
 * Fixed indicative rates against EUR, the app's canonical storage currency.
 * All business logic (thresholds, order totals) is computed in EUR; this
 * table is consulted only at display time. Swapping in a live FX feed later
 * means replacing this lookup, not touching any call site.
 */
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
};

export function getCurrencyMeta(code: CurrencyCode): CurrencyMeta {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}

export function convertFromEur(amountEur: number, currency: CurrencyCode): number {
  return amountEur * EXCHANGE_RATES[currency];
}

export function formatMoney(amountEur: number, currency: CurrencyCode): string {
  const meta = getCurrencyMeta(currency);
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertFromEur(amountEur, currency));
}
