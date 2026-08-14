import "server-only";
import { timingSafeEqual } from "crypto";
import { adminAccessCode, isAdminGateConfigured } from "@/lib/env";

const ADMIN_HEADER = "x-admin-code";

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** True when the request may proceed: no gate configured, or a matching code was supplied. */
export function isAdminRequestAuthorized(request: Request): boolean {
  if (!isAdminGateConfigured) return true;
  const supplied = request.headers.get(ADMIN_HEADER) ?? "";
  return Boolean(supplied) && safeEquals(supplied, adminAccessCode);
}

export function verifyAdminCode(code: string): boolean {
  if (!isAdminGateConfigured) return true;
  return safeEquals(code, adminAccessCode);
}
