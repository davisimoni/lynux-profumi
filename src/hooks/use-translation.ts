"use client";

import { useLocaleStore } from "@/store/locale";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { dictionaries, type Locale } from "@/lib/i18n/dictionary";

export function useTranslation() {
  const mounted = useHasMounted();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const effectiveLocale: Locale = mounted ? locale : "it";

  return {
    locale: effectiveLocale,
    setLocale,
    t: dictionaries[effectiveLocale],
  };
}
