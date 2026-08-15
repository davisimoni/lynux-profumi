"use client";

import { useState, type FormEvent } from "react";
import { Gem } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("subscription_failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="border-b border-border bg-obsidian">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
          <Gem className="h-5 w-5" />
        </span>
        <p className="mt-6 text-xs uppercase tracking-luxe text-gold">Lynux Vault</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
          Accesso Riservato al Private Club
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Iscriviti alla Vault per ricevere accesso prioritario alle edizioni limitate, inviti agli
          eventi di lancio olfattivi e anteprime riservate ai membri, prima di chiunque altro.
        </p>

        {status === "success" ? (
          <p className="mt-8 text-sm text-gold">
            Benvenuto nella Vault. La tua iscrizione è confermata.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="La tua email"
              className="flex-1 rounded-sm border border-border bg-transparent px-4 py-3 text-sm text-cream placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-gold"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-sm bg-gold px-6 py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {status === "loading" ? "Invio…" : "Accedi alla Vault"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-xs text-destructive">Qualcosa è andato storto. Riprova tra poco.</p>
        )}
      </div>
    </section>
  );
}
