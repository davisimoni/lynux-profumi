import { NextResponse } from "next/server";
import { getOrdersRepository } from "@/lib/orders/repository";
import { isAdminRequestAuthorized } from "@/lib/admin/auth";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const orders = await getOrdersRepository().list();
  return NextResponse.json({ orders });
}
