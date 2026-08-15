import { NextResponse } from "next/server";
import { z } from "zod";
import { reserveStock } from "@/lib/inventory";

const reserveRequestSchema = z.object({
  sessionKey: z.string().min(8).max(100),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        sizeLabel: z.string().min(1),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1)
    .max(50),
});

export async function POST(request: Request) {
  const parsed = reserveRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await reserveStock(parsed.data.sessionKey, parsed.data.lines);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason, productId: result.productId, available: "available" in result ? result.available : undefined },
      { status: result.reason === "insufficient_stock" ? 409 : 404 },
    );
  }

  return NextResponse.json({ reservation: result.reservation });
}
