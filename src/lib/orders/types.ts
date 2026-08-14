import type { CartItem } from "@/lib/cart-math";
import type { ShippingAddress, PaymentMethod } from "@/store/order";
import type { CurrencyCode } from "@/lib/currency";

export type OrderStatus =
  | "received"
  | "preparing"
  | "packed"
  | "shipped"
  | "out-for-delivery"
  | "delivered";

export const ORDER_STATUSES: OrderStatus[] = [
  "received",
  "preparing",
  "packed",
  "shipped",
  "out-for-delivery",
  "delivered",
];

export const ADMIN_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Ordine Ricevuto",
  preparing: "In Laboratorio",
  packed: "Confezionato",
  shipped: "Spedito",
  "out-for-delivery": "In Consegna",
  delivered: "Consegnato",
};

export interface PersistedOrder {
  orderNumber: string;
  status: OrderStatus;
  currency: CurrencyCode;
  subtotal: number;
  shipping: number;
  total: number;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}
