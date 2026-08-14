import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrdersRepository } from "@/lib/orders/repository";
import { ORDER_STATUSES } from "@/lib/orders/types";
import { isValidSignedOrderNumber } from "@/lib/order-security";
import { isAdminRequestAuthorized } from "@/lib/admin/auth";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { code } = await params;
  const orderNumber = code.trim().toUpperCase();

  if (!isValidSignedOrderNumber(orderNumber)) {
    return NextResponse.json({ error: "invalid_order_number" }, { status: 400 });
  }

  const order = await getOrdersRepository().getByOrderNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const orderNumber = code.trim().toUpperCase();

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const updated = await getOrdersRepository().updateStatus(
    orderNumber,
    parsed.data.status as (typeof ORDER_STATUSES)[number],
  );

  if (!updated) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  return NextResponse.json({ order: updated });
}
