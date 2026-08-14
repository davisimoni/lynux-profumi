import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { orderHmacSecret } from "@/lib/env";

const SIGNATURE_LENGTH = 8;

function sign(base: string): string {
  return createHmac("sha256", orderHmacSecret)
    .update(base)
    .digest("hex")
    .slice(0, SIGNATURE_LENGTH)
    .toUpperCase();
}

/**
 * Builds a customer-facing order number with an HMAC suffix so a code
 * cannot be forged or enumerated to snoop on another customer's order —
 * `/api/orders/[code]` verifies the signature before ever touching storage.
 */
export function generateSignedOrderNumber(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const base = `LYNUX-${datePart}-${randomPart}`;
  return `${base}-${sign(base)}`;
}

export function isValidSignedOrderNumber(orderNumber: string): boolean {
  const parts = orderNumber.trim().toUpperCase().split("-");
  if (parts.length !== 4 || parts[0] !== "LYNUX") return false;

  const [, datePart, randomPart, signature] = parts;
  const base = `LYNUX-${datePart}-${randomPart}`;
  const expected = sign(base);

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature.padEnd(expected.length, "\0").slice(0, expected.length));
  if (expectedBuffer.length !== actualBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
