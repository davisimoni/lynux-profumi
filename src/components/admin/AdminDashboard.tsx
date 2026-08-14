"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  ShoppingCart,
  Crown,
  Boxes,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeAdminMetrics } from "@/lib/admin/metrics";
import { ADMIN_STATUS_LABELS, ORDER_STATUSES, type OrderStatus, type PersistedOrder } from "@/lib/orders/types";
import { useMoney } from "@/hooks/use-money";
import { formatMoney } from "@/lib/currency";

interface AdminDashboardProps {
  adminCode: string;
}

function authHeaders(adminCode: string): HeadersInit {
  return adminCode ? { "x-admin-code": adminCode } : {};
}

export function AdminDashboard({ adminCode }: AdminDashboardProps) {
  const [orders, setOrders] = useState<PersistedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const money = useMoney();

  async function loadOrders() {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/orders", { headers: authHeaders(adminCode) });
      if (!response.ok) {
        setLoadError("Impossibile caricare gli ordini.");
        return;
      }
      const data = (await response.json()) as { orders: PersistedOrder[] };
      setOrders(data.orders);
    } catch {
      setLoadError("Errore di rete durante il caricamento degli ordini.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // loadOrders sets loading/orders state itself — an intentional
    // fetch-on-mount, not a value derived from props/state that belongs in
    // render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => computeAdminMetrics(orders), [orders]);

  async function handleStatusChange(orderNumber: string, status: OrderStatus) {
    setUpdatingOrder(orderNumber);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(adminCode) },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        toast.error("Aggiornamento stato non riuscito.");
        return;
      }

      const data = (await response.json()) as { order: PersistedOrder };
      setOrders((prev) => prev.map((order) => (order.orderNumber === orderNumber ? data.order : order)));
      toast.success(`Ordine ${orderNumber} aggiornato`, {
        description: ADMIN_STATUS_LABELS[status],
      });
    } catch {
      toast.error("Errore di rete durante l'aggiornamento.");
    } finally {
      setUpdatingOrder(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-luxe text-gold">Area Riservata</p>
          <h1 className="mt-2 font-display text-4xl font-light text-cream">Admin Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-xs uppercase tracking-wide text-cream transition-colors hover:border-gold hover:text-gold disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Aggiorna
        </button>
      </div>

      {loadError && (
        <p className="mb-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label="Fatturato Totale"
          value={money(metrics.totalRevenueEur)}
        />
        <MetricCard icon={ShoppingCart} label="Volume Ordini" value={String(metrics.orderCount)} />
        <MetricCard
          icon={Crown}
          label="Profumo più Venduto"
          value={metrics.bestSeller ? metrics.bestSeller.name : "—"}
          detail={metrics.bestSeller ? `${metrics.bestSeller.unitsSold} unità vendute` : undefined}
        />
        <MetricCard
          icon={Boxes}
          label="Referenze in Scorta Bassa"
          value={String(metrics.inventory.filter((row) => row.lowStock).length)}
          detail={`su ${metrics.inventory.length} referenze`}
        />
      </div>

      <div className="mt-10 rounded-md border border-border bg-card p-6 sm:p-8">
        <p className="mb-5 text-xs uppercase tracking-luxe text-gold">Inventario Boccette</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 font-normal">Fragranza</th>
                <th className="pb-3 font-normal">Scorta Iniziale</th>
                <th className="pb-3 font-normal">Vendute</th>
                <th className="pb-3 font-normal">Rimanenti</th>
              </tr>
            </thead>
            <tbody>
              {metrics.inventory.map((row) => (
                <tr key={row.productId} className="border-b border-border last:border-none">
                  <td className="py-3 text-cream">{row.name}</td>
                  <td className="py-3 text-muted-foreground">{row.stockUnits}</td>
                  <td className="py-3 text-muted-foreground">{row.unitsSold}</td>
                  <td className="py-3">
                    <span
                      className={
                        row.lowStock
                          ? "inline-flex items-center gap-1.5 text-destructive"
                          : "text-cream"
                      }
                    >
                      {row.lowStock && <AlertTriangle className="h-3.5 w-3.5" />}
                      {row.remaining}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 rounded-md border border-border bg-card p-6 sm:p-8">
        <p className="mb-5 text-xs uppercase tracking-luxe text-gold">Gestione Ordini</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 font-normal">Ordine</th>
                <th className="pb-3 font-normal">Cliente</th>
                <th className="pb-3 font-normal">Data</th>
                <th className="pb-3 font-normal">Totale</th>
                <th className="pb-3 font-normal">Stato</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderNumber} className="border-b border-border last:border-none">
                  <td className="py-3 font-display text-gold">{order.orderNumber}</td>
                  <td className="py-3 text-cream">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 text-cream">{formatMoney(order.total, order.currency)}</td>
                  <td className="py-3">
                    <Select
                      value={order.status}
                      onValueChange={(value) => value && handleStatusChange(order.orderNumber, value as OrderStatus)}
                    >
                      <SelectTrigger
                        disabled={updatingOrder === order.orderNumber}
                        className="w-[170px] border-border bg-transparent text-xs uppercase tracking-wide text-cream"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {ADMIN_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && !loading && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nessun ordine trovato.
            </p>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Dashboard demo di portfolio. In assenza di Supabase, ordini e inventario sono calcolati su
        dati dimostrativi in memoria del server.
      </p>
    </div>
  );
}

interface MetricCardProps {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  detail?: string;
}

function MetricCard({ icon: Icon, label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-cream">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}
