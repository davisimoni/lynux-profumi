"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lock, KeyRound, LayoutDashboard } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const STORAGE_KEY = "lynux-admin-code";

interface AdminGateProps {
  gateConfigured: boolean;
}

export function AdminGate({ gateConfigured }: AdminGateProps) {
  const [restoring, setRestoring] = useState(gateConfigured);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!gateConfigured) return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminCode(stored);
    }
    setRestoring(false);
  }, [gateConfigured]);

  function handleUnlockClick() {
    setAdminCode("");
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput }),
      });

      if (!response.ok) {
        setError("Codice non valido.");
        return;
      }

      sessionStorage.setItem(STORAGE_KEY, codeInput);
      setAdminCode(codeInput);
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setChecking(false);
    }
  }

  if (restoring) {
    return <div className="mx-auto max-w-md px-4 py-24 sm:px-6" />;
  }

  if (adminCode !== null) {
    return <AdminDashboard adminCode={adminCode} />;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold">
        <LayoutDashboard className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-luxe text-gold">Area Riservata</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-cream">Admin Dashboard</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {gateConfigured
            ? "Inserisci il codice di accesso per consultare fatturato, ordini e inventario."
            : "Modalità demo di portfolio: nessuna autenticazione reale è richiesta."}
        </p>
      </div>

      {gateConfigured ? (
        <form onSubmit={handleVerify} className="flex w-full flex-col gap-3">
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Codice di accesso"
              className="w-full rounded-sm border border-border bg-transparent py-2.5 pl-10 pr-3.5 text-sm text-cream outline-none transition-colors focus:border-gold"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={checking}
            className="flex items-center justify-center gap-2 rounded-sm bg-gold py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" />
            Sblocca Dashboard
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={handleUnlockClick}
          className="flex items-center gap-2 rounded-sm bg-gold px-8 py-3.5 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 cursor-pointer"
        >
          <LayoutDashboard className="h-4 w-4" />
          Accedi alla Dashboard Demo
        </button>
      )}
    </div>
  );
}
