"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ClipboardCheck,
  PackageOpen,
  PackageCheck,
  Truck,
  MapPinned,
  Home,
  PackageSearch,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import {
  TRACKING_STAGES,
  baselineElapsedSeconds,
  computeStageIndex,
  estimatedStageDate,
} from "@/lib/order-tracking";
import { ORDER_STATUSES, type PersistedOrder } from "@/lib/orders/types";
import { useOrderStore } from "@/store/order";
import { useHasMounted } from "@/hooks/use-has-mounted";

const STAGE_ICONS: LucideIcon[] = [
  ClipboardCheck,
  PackageOpen,
  PackageCheck,
  Truck,
  MapPinned,
  Home,
];

const POLL_INTERVAL_MS = 6000;

function formatStageDate(date: Date): string {
  return date.toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TrackOrderClient() {
  const mounted = useHasMounted();
  const lastOrder = useOrderStore((state) => state.lastOrder);

  const [inputCode, setInputCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [trackedAtMs, setTrackedAtMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [error, setError] = useState<string | null>(null);

  const [serverOrder, setServerOrder] = useState<PersistedOrder | null>(null);
  const [serverChecked, setServerChecked] = useState(false);

  useEffect(() => {
    // Deep-link from the order-confirmation page (?code=...): applied after
    // mount, same rationale as the catalog's ?family= filter — the static
    // shell always renders the empty search form first.
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code");
    if (codeFromUrl) {
      const normalized = codeFromUrl.trim().toUpperCase();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputCode(normalized);
      setSubmittedCode(normalized);
      setTrackedAtMs(Date.now());
    }
  }, []);

  // Cross-device lookup: the order number is HMAC-signed, so any browser can
  // ask the backend for its current status. Polls so an admin flipping the
  // status in /admin shows up here without a manual refresh.
  useEffect(() => {
    if (!submittedCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setServerOrder(null);
      setServerChecked(false);
      return;
    }

    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(submittedCode!)}`);
        if (cancelled) return;
        if (response.ok) {
          const data = (await response.json()) as { order: PersistedOrder };
          setServerOrder(data.order);
        } else {
          setServerOrder(null);
        }
      } catch {
        if (!cancelled) setServerOrder(null);
      } finally {
        if (!cancelled) setServerChecked(true);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [submittedCode]);

  useEffect(() => {
    if (!submittedCode) return;
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [submittedCode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = inputCode.trim().toUpperCase();
    if (normalized.length === 0) {
      setError("Inserisci un codice ordine per continuare.");
      return;
    }
    setError(null);
    setSubmittedCode(normalized);
    setTrackedAtMs(Date.now());
    setNowMs(Date.now());
  }

  function handleTrackLastOrder() {
    if (!lastOrder) return;
    setInputCode(lastOrder.orderNumber);
    setSubmittedCode(lastOrder.orderNumber.toUpperCase());
    setTrackedAtMs(Date.now());
    setNowMs(Date.now());
    setError(null);
  }

  function handleReset() {
    setSubmittedCode(null);
    setTrackedAtMs(null);
    setInputCode("");
    setError(null);
  }

  const localOrder =
    mounted && lastOrder && submittedCode && lastOrder.orderNumber.toUpperCase() === submittedCode
      ? lastOrder
      : null;

  const tracking = useMemo(() => {
    if (!submittedCode || trackedAtMs === null || !serverChecked) return null;

    if (serverOrder) {
      return {
        referenceDate: new Date(serverOrder.createdAt),
        stageIndex: Math.max(0, ORDER_STATUSES.indexOf(serverOrder.status)),
      };
    }

    let referenceDate: Date;
    let elapsedSeconds: number;

    if (localOrder) {
      referenceDate = new Date(localOrder.date);
      elapsedSeconds = Math.max(0, Math.floor((nowMs - referenceDate.getTime()) / 1000));
    } else {
      const baseline = baselineElapsedSeconds(submittedCode);
      referenceDate = new Date(trackedAtMs - baseline * 1000);
      elapsedSeconds = baseline + Math.max(0, Math.floor((nowMs - trackedAtMs) / 1000));
    }

    return {
      referenceDate,
      stageIndex: computeStageIndex(elapsedSeconds),
    };
  }, [submittedCode, trackedAtMs, localOrder, nowMs, serverOrder, serverChecked]);

  const summaryItems = serverOrder?.items ?? localOrder?.items ?? null;
  const summaryTotal = serverOrder?.total ?? localOrder?.total ?? null;
  const summaryCurrency = serverOrder?.currency ?? localOrder?.currency ?? "EUR";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-2 text-xs uppercase tracking-luxe text-gold">
          <PackageSearch className="h-4 w-4" />
          Order Tracking
        </p>
        <h1 className="font-display text-4xl font-semibold text-cream sm:text-5xl">
          Traccia il tuo Ordine
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Inserisci il codice ricevuto alla conferma d&apos;ordine per seguire lo stato di
          preparazione e spedizione in tempo reale, da qualsiasi dispositivo.
        </p>
      </div>

      {!submittedCode && (
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-md flex-col gap-3 rounded-md border border-border bg-card p-6"
        >
          <label htmlFor="order-code" className="text-xs uppercase tracking-wide text-muted-foreground">
            Codice Ordine
          </label>
          <input
            id="order-code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="LYNUX-20260214-1234-A1B2C3D4"
            className="w-full rounded-sm border border-border bg-transparent px-3.5 py-2.5 text-sm uppercase text-cream placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-gold"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            className="mt-1 rounded-sm bg-gold py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 cursor-pointer"
          >
            Traccia Ordine
          </button>

          {mounted && lastOrder && (
            <button
              type="button"
              onClick={handleTrackLastOrder}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-gold cursor-pointer"
            >
              Usa il tuo ultimo ordine: {lastOrder.orderNumber}
            </button>
          )}
        </form>
      )}

      {submittedCode && !tracking && (
        <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-card py-16 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">Verifica del codice ordine…</p>
        </div>
      )}

      {tracking && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ordine</p>
              <p className="font-display text-lg text-gold">{submittedCode}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Aggiornamento in tempo reale
              </span>
            </div>
          </div>

          {!serverOrder && !localOrder && (
            <p className="rounded-sm border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
              Codice non trovato sul backend degli ordini — la timeline mostra una simulazione
              realistica dello stato di spedizione.
            </p>
          )}
          {!serverOrder && localOrder && (
            <p className="rounded-sm border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
              Ordine trovato solo su questo dispositivo — in modalità Fallback (senza Supabase
              configurato) il tracciamento multi-dispositivo non è disponibile.
            </p>
          )}

          <div className="rounded-md border border-border bg-card p-6 sm:p-8">
            <ol className="space-y-0">
              {TRACKING_STAGES.map((stage, index) => {
                const Icon = STAGE_ICONS[index];
                const isDone = index < tracking.stageIndex;
                const isCurrent = index === tracking.stageIndex;
                const isFuture = index > tracking.stageIndex;
                const stageDate = estimatedStageDate(tracking.referenceDate, index);

                return (
                  <li key={stage.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                          isDone && "border-gold bg-gold text-obsidian",
                          isCurrent && "border-gold text-gold",
                          isFuture && "border-border text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      {index < TRACKING_STAGES.length - 1 && (
                        <span
                          className={cn(
                            "w-px flex-1",
                            isDone ? "bg-gold" : "bg-border",
                          )}
                          style={{ minHeight: "2.5rem" }}
                        />
                      )}
                    </div>
                    <div className={cn("pb-8", isFuture && "opacity-50")}>
                      <p
                        className={cn(
                          "font-display text-lg",
                          isCurrent ? "text-gold" : "text-cream",
                        )}
                      >
                        {stage.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs uppercase tracking-wide text-gold">
                            In corso
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {isFuture ? "In programma" : formatStageDate(stageDate)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {summaryItems && summaryTotal !== null && (
            <div className="rounded-md border border-border bg-card p-6 sm:p-8">
              <p className="mb-4 text-xs uppercase tracking-luxe text-gold">Riepilogo Ordine</p>
              <ul className="space-y-3">
                {summaryItems.map((item) => (
                  <li
                    key={`${item.productId}-${item.sizeLabel}`}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.name}{" "}
                      <span className="text-muted-foreground/70">
                        ({item.sizeLabel} × {item.quantity})
                      </span>
                    </span>
                    <span className="text-cream">
                      {formatMoney(item.unitPrice * item.quantity, summaryCurrency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-display text-cream">Totale Pagato</span>
                <span className="font-display text-lg text-gold">
                  {formatMoney(summaryTotal, summaryCurrency)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground hover:text-gold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Traccia un altro ordine
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
