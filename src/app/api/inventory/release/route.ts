import { NextResponse } from "next/server";
import { z } from "zod";
import { releaseReservation } from "@/lib/inventory";

const releaseRequestSchema = z.object({
  reservationId: z.string().min(1),
});

export async function POST(request: Request) {
  // sendBeacon (used on tab close / navigation away) posts a Blob with no
  // Content-Type we control, so JSON parsing must tolerate that shape too.
  const raw = await request.text();
  let body: unknown = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = releaseRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  await releaseReservation(parsed.data.reservationId);
  return NextResponse.json({ released: true });
}
