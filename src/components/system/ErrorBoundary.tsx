"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import Link from "next/link";
import { RotateCcw, ShieldAlert } from "lucide-react";
import { telemetry } from "@/lib/telemetry";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorId: string | null;
}

/**
 * Class component by necessity — React has no hook equivalent for catching
 * render errors in a subtree (getDerivedStateFromError/componentDidCatch
 * only exist on classes as of React 19). Wraps `<main>` in the root layout
 * so a crash anywhere in a page's content still leaves the header, cart and
 * navigation usable for recovery.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorId: null };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true, errorId: Date.now().toString(36).toUpperCase() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    telemetry.error("ui.crash", error.message, {
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorId: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 text-gold">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-luxe text-gold">Imprevisto</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">
          Anche le essenze più rare, a volte, si disperdono
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Qualcosa non ha funzionato come previsto in questa pagina. Il nostro atelier ne è stato
          informato — puoi riprovare o tornare alla collezione.
        </p>
        {this.state.errorId && (
          <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground/60">
            Codice errore: {this.state.errorId}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={this.handleRetry}
            className="flex items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Riprova
          </button>
          <Link
            href="/"
            className="flex items-center justify-center rounded-sm border border-border px-6 py-3 text-xs uppercase tracking-luxe text-cream transition-colors hover:border-gold hover:text-gold"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    );
  }
}
