"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Wallet, Loader2, ShieldCheck, TimerReset, TriangleAlert } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { StripePaymentSection, type StripeApi } from "@/components/checkout/StripePaymentSection";
import { isStripeEnabledClient } from "@/lib/stripe/browser";
import { cartShipping, cartSubtotal, cartVatIncluded, useCartStore } from "@/store/cart";
import { useOrderStore, type PaymentMethod, type ShippingAddress } from "@/store/order";
import { useCurrencyStore } from "@/store/currency";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useMoney } from "@/hooks/use-money";
import { useStockReservation } from "@/hooks/use-stock-reservation";
import { telemetry } from "@/lib/telemetry";

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const EMPTY_ADDRESS: ShippingAddress = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postalCode: "",
  province: "",
  country: "Italia",
  phone: "",
  email: "",
};

const inputClass =
  "w-full rounded-sm border border-border bg-transparent px-3.5 py-2.5 text-sm text-cream placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-gold";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground";

interface CheckoutSession {
  mode: "demo" | "stripe";
  orderNumber: string;
  clientSecret?: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const mounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const setLastOrder = useOrderStore((state) => state.setLastOrder);
  const currency = useCurrencyStore((state) => state.currency);
  const money = useMoney();
  const reservation = useStockReservation(items);

  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);

  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const stripeApiRef = useRef<StripeApi | null>(null);

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);
  const vatIncluded = cartVatIncluded(subtotal);
  const total = subtotal + shipping;

  const useRealStripe = isStripeEnabledClient && paymentMethod === "card";

  // Eagerly create the PaymentIntent as soon as the customer reaches the
  // card step, so Elements has a clientSecret ready before they start
  // typing. Nothing is persisted to the orders backend at this point — see
  // /api/checkout for why.
  useEffect(() => {
    if (!useRealStripe || !mounted || items.length === 0) return;
    if (checkoutSession?.mode === "stripe" || sessionLoading) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionLoading(true);

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, paymentMethod, currency }),
    })
      .then((response) => response.json())
      .then((data: CheckoutSession & { error?: string }) => {
        if (cancelled) return;
        if (data.mode === "stripe" && data.clientSecret) {
          setCheckoutSession(data);
        } else {
          toast.error("Impossibile inizializzare il pagamento Stripe. Riprova tra poco.");
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Errore di rete durante l'inizializzazione del pagamento.");
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // checkoutSession/sessionLoading are read only as re-entrancy guards, not
    // triggers: adding them here would re-run this effect the instant they're
    // set, whose guard would then bail out and strand the in-flight request
    // (its result gets discarded by the `cancelled` cleanup) without ever
    // starting a replacement one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRealStripe, mounted, items.length, paymentMethod, currency]);

  const handleStripeReady = useCallback((api: StripeApi) => {
    stripeApiRef.current = api;
  }, []);

  function finalizeOrder(orderNumber: string, finalSubtotal: number, finalShipping: number, finalTotal: number) {
    setLastOrder({
      orderNumber,
      date: new Date().toISOString(),
      items,
      subtotal: finalSubtotal,
      shipping: finalShipping,
      vatIncluded: cartVatIncluded(finalSubtotal),
      total: finalTotal,
      shippingAddress: address,
      paymentMethod,
      currency,
    });
    reservation.release();
    telemetry.info("checkout.order_confirmed", "Ordine confermato dal cliente", {
      orderNumber,
      total: finalTotal,
      currency,
      paymentMethod,
    });
    clearCart();
    router.push("/checkout/success");
  }

  function updateField<K extends keyof ShippingAddress>(field: K, value: ShippingAddress[K]) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (reservation.expired) {
      toast.error("La tua prenotazione di magazzino è scaduta. Aggiorna la pagina per riprovare.");
      telemetry.warn("checkout.submit_blocked_expired_reservation", "Submit bloccato: prenotazione scaduta");
      return;
    }

    setSubmitting(true);

    try {
      if (useRealStripe) {
        if (!checkoutSession || checkoutSession.mode !== "stripe" || !stripeApiRef.current) {
          toast.error("Il modulo di pagamento non è ancora pronto. Attendi un istante e riprova.");
          return;
        }

        const { stripe, elements } = stripeApiRef.current;
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

        if (error) {
          toast.error(error.message ?? "Pagamento non riuscito. Controlla i dati della carta.");
          telemetry.error("checkout.stripe_confirm_failed", error.message ?? "Pagamento non riuscito", {
            code: error.code,
          });
          return;
        }
        if (!paymentIntent || paymentIntent.status !== "succeeded") {
          toast.error("Il pagamento non è stato completato.");
          telemetry.error("checkout.stripe_incomplete", "PaymentIntent non risulta succeeded", {
            status: paymentIntent?.status,
          });
          return;
        }

        const confirmResponse = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            shippingAddress: address,
            paymentMethod,
            currency,
            orderNumber: checkoutSession.orderNumber,
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (!confirmResponse.ok) {
          toast.error("Pagamento riuscito, ma la registrazione dell'ordine è fallita. Contattaci.");
          telemetry.error("checkout.confirm_persist_failed", "Pagamento riuscito ma /api/checkout/confirm ha fallito", {
            orderNumber: checkoutSession.orderNumber,
            status: confirmResponse.status,
          });
          return;
        }

        const confirmed = await confirmResponse.json();
        finalizeOrder(confirmed.orderNumber, confirmed.subtotal, confirmed.shipping, confirmed.total);
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shippingAddress: address, paymentMethod, currency }),
      });

      if (!response.ok) {
        toast.error("Non è stato possibile completare l'ordine. Riprova.");
        telemetry.error("checkout.demo_order_failed", "/api/checkout ha risposto con errore", {
          status: response.status,
        });
        return;
      }

      const data = await response.json();
      finalizeOrder(data.orderNumber, data.subtotal, data.shipping, data.total);
    } catch (error) {
      toast.error("Errore di rete. Controlla la connessione e riprova.");
      telemetry.error("checkout.network_error", error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <p className="font-display text-2xl text-cream">Il tuo carrello è vuoto</p>
        <p className="text-sm text-muted-foreground">
          Aggiungi una fragranza alla tua selezione prima di procedere al checkout.
        </p>
        <Link
          href="/catalog"
          className="mt-2 rounded-sm border border-gold px-6 py-3 text-xs uppercase tracking-luxe text-gold transition-colors hover:bg-gold hover:text-obsidian"
        >
          Esplora le Fragranze
        </Link>
      </div>
    );
  }

  const canSubmit =
    !submitting &&
    !reservation.expired &&
    (!useRealStripe || (checkoutSession?.mode === "stripe" && !sessionLoading));
  const reservationLow = reservation.remainingSeconds > 0 && reservation.remainingSeconds <= 60;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-luxe text-gold">Checkout</p>
        <h1 className="mt-2 font-display text-4xl font-light text-cream">Completa il tuo Ordine</h1>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 font-display text-xl text-cream">Contatto</h2>
            <div>
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={address.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass}
                placeholder="nome@esempio.it"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl text-cream">Indirizzo di Spedizione</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  Nome
                </label>
                <input
                  id="firstName"
                  required
                  value={address.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Cognome
                </label>
                <input
                  id="lastName"
                  required
                  value={address.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="address">
                  Indirizzo
                </label>
                <input
                  id="address"
                  required
                  value={address.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={inputClass}
                  placeholder="Via, numero civico"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="city">
                  Città
                </label>
                <input
                  id="city"
                  required
                  value={address.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="postalCode">
                  CAP
                </label>
                <input
                  id="postalCode"
                  required
                  value={address.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="province">
                  Provincia
                </label>
                <input
                  id="province"
                  required
                  value={address.province}
                  onChange={(e) => updateField("province", e.target.value)}
                  className={inputClass}
                  placeholder="es. MI"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="country">
                  Paese
                </label>
                <select
                  id="country"
                  required
                  value={address.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className={inputClass}
                >
                  <option>Italia</option>
                  <option>San Marino</option>
                  <option>Svizzera</option>
                  <option>Città del Vaticano</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="phone">
                  Telefono
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClass}
                  placeholder="+39"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl text-cream">Metodo di Pagamento</h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="gap-3"
            >
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3.5 transition-colors ${
                  paymentMethod === "card" ? "border-gold bg-gold/5" : "border-border"
                }`}
              >
                <RadioGroupItem value="card" />
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-cream">Carta di Credito</span>
                {isStripeEnabledClient && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wide text-gold">
                    <ShieldCheck className="h-3 w-3" />
                    Stripe
                  </span>
                )}
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3.5 transition-colors ${
                  paymentMethod === "apple-pay" ? "border-gold bg-gold/5" : "border-border"
                }`}
              >
                <RadioGroupItem value="apple-pay" />
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-cream">Apple Pay</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3.5 transition-colors ${
                  paymentMethod === "paypal" ? "border-gold bg-gold/5" : "border-border"
                }`}
              >
                <RadioGroupItem value="paypal" />
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-cream">PayPal</span>
              </label>
            </RadioGroup>

            {useRealStripe ? (
              <div className="mt-4 rounded-sm border border-border p-4">
                {checkoutSession?.mode === "stripe" ? (
                  <StripePaymentSection
                    clientSecret={checkoutSession.clientSecret!}
                    onReady={handleStripeReady}
                  />
                ) : (
                  <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparazione del modulo di pagamento sicuro…
                  </div>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
                  Pagamento elaborato da Stripe in modalità Test (Sandbox). Usa la carta{" "}
                  <span className="text-cream">4242 4242 4242 4242</span>, una data futura e un CVC
                  qualsiasi — nessun addebito reale verrà effettuato.
                </p>
              </div>
            ) : (
              paymentMethod === "card" && (
                <div className="mt-4 rounded-sm border border-border p-4">
                  <p className="text-xs text-muted-foreground">
                    Simulazione di pagamento — nessun dato reale viene elaborato o memorizzato.
                    Collega una chiave Stripe di test per abilitare il modulo di pagamento reale.
                  </p>
                </div>
              )
            )}
          </section>
        </div>

        <div className="h-fit rounded-md border border-border bg-card p-6">
          <h2 className="mb-5 font-display text-xl text-cream">Riepilogo Ordine</h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={`${item.productId}-${item.sizeLabel}`} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {item.name}{" "}
                  <span className="text-muted-foreground/70">
                    ({item.sizeLabel} × {item.quantity})
                  </span>
                </span>
                <span className="shrink-0 text-cream">
                  {money(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="my-5" />

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotale</span>
              <span className="text-cream">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spedizione</span>
              <span className="text-cream">{shipping === 0 ? "Gratuita" : money(shipping)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground/70">
              <span>di cui IVA (22%)</span>
              <span>{money(vatIncluded)}</span>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-cream">Totale</span>
            <span className="font-display text-2xl text-gold">{money(total)}</span>
          </div>

          {reservation.insufficientStock && (
            <div className="mt-4 flex items-center gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
              Disponibilità insufficiente per un articolo nel carrello (rimasti:{" "}
              {reservation.insufficientStock.available}). Aggiorna il carrello per continuare.
            </div>
          )}

          {!reservation.insufficientStock && reservation.expired && (
            <div className="mt-4 flex items-center gap-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
              La tua prenotazione di magazzino è scaduta. Aggiorna la pagina per riservare di nuovo
              lo stock.
            </div>
          )}

          {!reservation.insufficientStock && !reservation.expired && reservation.reservationId && (
            <div
              className={`mt-4 flex items-center justify-center gap-2 rounded-sm border px-3.5 py-2.5 text-xs uppercase tracking-wide ${
                reservationLow
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-gold/30 bg-gold/5 text-gold"
              }`}
            >
              <TimerReset className="h-3.5 w-3.5" />
              Riservato per te: {formatCountdown(reservation.remainingSeconds)}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-gold py-3.5 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Elaborazione
              </>
            ) : useRealStripe ? (
              `Paga ${money(total)}`
            ) : (
              "Conferma Ordine Demo"
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {useRealStripe
              ? "Transazione in modalità Test Stripe — nessun pagamento reale verrà effettuato."
              : "Ordine dimostrativo a scopo di portfolio. Nessun pagamento reale verrà effettuato."}
          </p>
        </div>
      </div>
    </form>
  );
}
