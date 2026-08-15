"use client";

import Link from "next/link";
import { CheckCircle2, PackageSearch } from "lucide-react";
import { ProductArt } from "@/components/product/ProductArt";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/currency";
import { useOrderStore } from "@/store/order";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useTranslation } from "@/hooks/use-translation";
import { COUNTRY_VALUES } from "@/lib/constants";

export function OrderSuccess() {
  const mounted = useHasMounted();
  const order = useOrderStore((state) => state.lastOrder);
  const { locale, t } = useTranslation();

  if (!mounted) {
    return <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6" />;
  }

  if (!order) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <p className="font-display text-2xl text-cream">{t.orderSuccess.noRecentOrder}</p>
        <p className="text-sm text-muted-foreground">{t.orderSuccess.noRecentOrderDescription}</p>
        <Link
          href="/catalog"
          className="mt-2 rounded-sm border border-gold px-6 py-3 text-xs uppercase tracking-luxe text-gold transition-colors hover:bg-gold hover:text-obsidian"
        >
          {t.orderSuccess.exploreCta}
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.date).toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const money = (amountEur: number) => formatMoney(amountEur, order.currency);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 text-gold">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-luxe text-gold">{t.orderSuccess.confirmed}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-cream">
          {t.orderSuccess.thankYou(order.shippingAddress.firstName)}
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">{t.orderSuccess.description}</p>
      </div>

      <div className="mt-10 rounded-md border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.orderSuccess.orderNumber}</p>
            <p className="font-display text-lg text-gold">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.orderSuccess.date}</p>
            <p className="text-cream">{orderDate}</p>
          </div>
        </div>

        <Separator className="my-6" />

        <ul className="space-y-4">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.sizeLabel}`} className="flex items-center gap-4">
              <div className="h-16 w-13 shrink-0 overflow-hidden rounded-sm bg-obsidian">
                <ProductArt accent={item.accent} accentSoft={item.accent} variant="bottle" />
              </div>
              <div className="flex flex-1 items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-cream">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.sizeLabel} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm text-cream">
                  {money(item.unitPrice * item.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <Separator className="my-6" />

        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.orderSuccess.subtotal}</span>
            <span className="text-cream">{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.orderSuccess.shipping}</span>
            <span className="text-cream">
              {order.shipping === 0 ? t.orderSuccess.free : money(order.shipping)}
            </span>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <span className="font-display text-lg text-cream">{t.orderSuccess.totalPaid}</span>
          <span className="font-display text-2xl text-gold">{money(order.total)}</span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-luxe text-gold">{t.orderSuccess.shippingLabel}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              <br />
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.postalCode} {order.shippingAddress.city} (
              {order.shippingAddress.province})
              <br />
              {t.checkout.countries[COUNTRY_VALUES.indexOf(order.shippingAddress.country)] ?? order.shippingAddress.country}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-luxe text-gold">{t.orderSuccess.paymentLabel}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.orderSuccess.paymentLabels[order.paymentMethod]}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        <p className="text-xs text-muted-foreground">{t.orderSuccess.demoNotice}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/track-order?code=${encodeURIComponent(order.orderNumber)}`}
            className="flex items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90"
          >
            <PackageSearch className="h-3.5 w-3.5" />
            {t.orderSuccess.trackOrder}
          </Link>
          <Link
            href="/catalog"
            className="rounded-sm border border-border px-6 py-3 text-xs uppercase tracking-luxe text-cream transition-colors hover:border-gold hover:text-gold"
          >
            {t.orderSuccess.continueShopping}
          </Link>
          <Link
            href="/"
            className="rounded-sm border border-border px-6 py-3 text-xs uppercase tracking-luxe text-cream transition-colors hover:border-gold hover:text-gold"
          >
            {t.orderSuccess.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
