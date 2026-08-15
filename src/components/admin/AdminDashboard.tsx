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
import { ORDER_STATUSES, type OrderStatus, type PersistedOrder } from "@/lib/orders/types";
import { useMoney } from "@/hooks/use-money";
import { formatMoney } from "@/lib/currency";
import { useTranslation } from "@/hooks/use-translation";

interface AdminDashboardProps {
  adminCode: string;
}

function authHeaders(adminCode: string): HeadersInit {
  return adminCode ? { "x-admin-code": adminCode } : {};
}

export function AdminDashboard({ adminCode }: AdminDashboardProps) {
  const { locale, t } = useTranslation();
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
        setLoadError(t.admin.loadError);
        return;
      }
      const data = (await response.json()) as { orders: PersistedOrder[] };
      setOrders(data.orders);
    } catch {
      setLoadError(t.admin.loadNetworkError);
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
        toast.error(t.admin.updateFailed);
        return;
      }

      const data = (await response.json()) as { order: PersistedOrder };
      setOrders((prev) => prev.map((order) => (order.orderNumber === orderNumber ? data.order : order)));
      toast.success(t.admin.orderUpdatedToast(orderNumber), {
        description: t.admin.statusLabels[status],
      });
    } catch {
      toast.error(t.admin.updateNetworkError);
    } finally {
      setUpdatingOrder(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-luxe text-gold">{t.admin.restrictedArea}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-cream">{t.admin.title}</h1>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-xs uppercase tracking-wide text-cream transition-colors hover:border-gold hover:text-gold disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {t.admin.refresh}
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
          label={t.admin.metrics.totalRevenue}
          value={money(metrics.totalRevenueEur)}
        />
        <MetricCard icon={ShoppingCart} label={t.admin.metrics.orderVolume} value={String(metrics.orderCount)} />
        <MetricCard
          icon={Crown}
          label={t.admin.metrics.bestSeller}
          value={metrics.bestSeller ? metrics.bestSeller.name : "—"}
          detail={metrics.bestSeller ? t.admin.metrics.unitsSold(metrics.bestSeller.unitsSold) : undefined}
        />
        <MetricCard
          icon={Boxes}
          label={t.admin.metrics.lowStock}
          value={String(metrics.inventory.filter((row) => row.lowStock).length)}
          detail={t.admin.metrics.ofReferences(metrics.inventory.length)}
        />
      </div>

      <div className="mt-10 rounded-md border border-border bg-card p-6 sm:p-8">
        <p className="mb-5 text-xs uppercase tracking-luxe text-gold">{t.admin.inventoryTitle}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 font-normal">{t.admin.inventoryColumns.fragrance}</th>
                <th className="pb-3 font-normal">{t.admin.inventoryColumns.initialStock}</th>
                <th className="pb-3 font-normal">{t.admin.inventoryColumns.sold}</th>
                <th className="pb-3 font-normal">{t.admin.inventoryColumns.remaining}</th>
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
        <p className="mb-5 text-xs uppercase tracking-luxe text-gold">{t.admin.ordersTitle}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 font-normal">{t.admin.ordersColumns.order}</th>
                <th className="pb-3 font-normal">{t.admin.ordersColumns.customer}</th>
                <th className="pb-3 font-normal">{t.admin.ordersColumns.date}</th>
                <th className="pb-3 font-normal">{t.admin.ordersColumns.total}</th>
                <th className="pb-3 font-normal">{t.admin.ordersColumns.status}</th>
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
                    {new Date(order.createdAt).toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
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
                            {t.admin.statusLabels[status]}
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
            <p className="py-10 text-center text-sm text-muted-foreground">{t.admin.noOrders}</p>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">{t.admin.demoFooter}</p>
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
