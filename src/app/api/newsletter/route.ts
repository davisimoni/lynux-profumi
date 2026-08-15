import { NextResponse } from "next/server";
import { z } from "zod";
import { telemetry } from "@/lib/telemetry";

const newsletterSchema = z.object({ email: z.string().email() });

// In-memory fallback, same "Fallback Mode" pattern as orders/reviews: no ESP
// (Klaviyo/Mailchimp) is configured in this environment, so signups are
// deduplicated and logged in-process rather than actually emailed.
const globalForNewsletter = globalThis as unknown as { __lynuxNewsletterEmails?: Set<string> };

function getStore(): Set<string> {
  if (!globalForNewsletter.__lynuxNewsletterEmails) {
    globalForNewsletter.__lynuxNewsletterEmails = new Set();
  }
  return globalForNewsletter.__lynuxNewsletterEmails;
}

export async function POST(request: Request) {
  const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const store = getStore();
  const alreadySubscribed = store.has(email);
  store.add(email);

  telemetry.info(
    "newsletter.signup",
    alreadySubscribed ? "Iscrizione Lynux Vault (già presente)" : "Nuova iscrizione Lynux Vault",
    { email },
  );

  return NextResponse.json({ subscribed: true });
}
