import { products } from "@/data/products";
import { generateSignedOrderNumber } from "@/lib/order-security";
import type { CartItem } from "@/lib/cart-math";
import type { OrderStatus, PersistedOrder } from "@/lib/orders/types";

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function item(productId: string, sizeIndex: number, quantity: number): CartItem {
  const product = products.find((candidate) => candidate.id === productId)!;
  const size = product.sizes[sizeIndex];
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    family: product.family,
    sizeLabel: size.label,
    sizeMl: size.ml,
    unitPrice: size.price,
    quantity,
    accent: product.accent,
  };
}

function total(items: CartItem[]): { subtotal: number; shipping: number; total: number } {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 9.9;
  return { subtotal, shipping, total: subtotal + shipping };
}

interface SeedInput {
  daysBack: number;
  status: OrderStatus;
  firstName: string;
  lastName: string;
  city: string;
  province: string;
  items: CartItem[];
}

const SEED_INPUTS: SeedInput[] = [
  {
    daysBack: 26,
    status: "delivered",
    firstName: "Giulia",
    lastName: "Ferrari",
    city: "Milano",
    province: "MI",
    items: [item("1", 2, 1)],
  },
  {
    daysBack: 24,
    status: "delivered",
    firstName: "Marco",
    lastName: "Colombo",
    city: "Roma",
    province: "RM",
    items: [item("3", 1, 1), item("5", 0, 2)],
  },
  {
    daysBack: 21,
    status: "delivered",
    firstName: "Chiara",
    lastName: "Bianchi",
    city: "Torino",
    province: "TO",
    items: [item("5", 1, 1)],
  },
  {
    daysBack: 19,
    status: "delivered",
    firstName: "Alessandro",
    lastName: "Ricci",
    city: "Firenze",
    province: "FI",
    items: [item("2", 2, 1)],
  },
  {
    daysBack: 16,
    status: "delivered",
    firstName: "Francesca",
    lastName: "Romano",
    city: "Bologna",
    province: "BO",
    items: [item("1", 1, 1), item("6", 0, 1)],
  },
  {
    daysBack: 13,
    status: "shipped",
    firstName: "Davide",
    lastName: "Gallo",
    city: "Napoli",
    province: "NA",
    items: [item("4", 1, 1)],
  },
  {
    daysBack: 11,
    status: "shipped",
    firstName: "Sara",
    lastName: "Conti",
    city: "Venezia",
    province: "VE",
    items: [item("3", 2, 1)],
  },
  {
    daysBack: 9,
    status: "shipped",
    firstName: "Matteo",
    lastName: "Villa",
    city: "Verona",
    province: "VR",
    items: [item("1", 2, 1), item("2", 0, 1)],
  },
  {
    daysBack: 7,
    status: "packed",
    firstName: "Elena",
    lastName: "Marino",
    city: "Bari",
    province: "BA",
    items: [item("5", 2, 1)],
  },
  {
    daysBack: 5,
    status: "preparing",
    firstName: "Luca",
    lastName: "Barbieri",
    city: "Genova",
    province: "GE",
    items: [item("6", 1, 1)],
  },
  {
    daysBack: 3,
    status: "preparing",
    firstName: "Martina",
    lastName: "Fontana",
    city: "Padova",
    province: "PD",
    items: [item("1", 1, 1)],
  },
  {
    daysBack: 1,
    status: "received",
    firstName: "Simone",
    lastName: "Greco",
    city: "Palermo",
    province: "PA",
    items: [item("4", 2, 1), item("3", 0, 1)],
  },
];

export function buildSeedOrders(): PersistedOrder[] {
  return SEED_INPUTS.map((input) => {
    const createdAt = daysAgo(input.daysBack).toISOString();
    const { subtotal, shipping, total: totalAmount } = total(input.items);

    const order: PersistedOrder = {
      orderNumber: generateSignedOrderNumber(),
      status: input.status,
      currency: "EUR",
      subtotal,
      shipping,
      total: totalAmount,
      items: input.items,
      shippingAddress: {
        firstName: input.firstName,
        lastName: input.lastName,
        address: "Via Demo 1",
        city: input.city,
        postalCode: "00100",
        province: input.province,
        country: "Italia",
        phone: "+39 320 0000000",
        email: `${input.firstName.toLowerCase()}.${input.lastName.toLowerCase()}@example.com`,
      },
      paymentMethod: "card",
      stripePaymentIntentId: null,
      createdAt,
      updatedAt: createdAt,
    };

    return order;
  });
}
