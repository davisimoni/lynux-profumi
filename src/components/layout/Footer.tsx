import Link from "next/link";
import { Sparkles } from "lucide-react";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4.5 w-4.5">
      <path d="M15 8.5h-2c-.8 0-1.5.7-1.5 1.5v2h3.5l-.5 3H11.5v7h-3v-7H6.5v-3H8.5v-2.2C8.5 6.9 10.2 5 12.8 5H15v3.5z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-obsidian">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <span className="font-display text-2xl tracking-luxe text-cream">LYNUX</span>
            <p className="max-w-sm text-sm text-muted-foreground">
              Profumeria di nicchia per chi cerca l&apos;essenza, non l&apos;ovvio. Fragranze
              composte con materie prime rare, in edizioni discrete e senza compromessi.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a
                href="#"
                aria-label="Instagram"
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                <InstagramIcon />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-luxe text-gold">Shop</p>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/catalog" className="transition-colors hover:text-cream">
                Catalogo
              </Link>
              <Link href="/scent-finder" className="transition-colors hover:text-cream">
                Scent Finder
              </Link>
              <Link href="/custom-blend" className="transition-colors hover:text-cream">
                Layering Lab
              </Link>
              <Link href="/checkout" className="transition-colors hover:text-cream">
                Checkout
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-luxe text-gold">Assistenza</p>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/track-order" className="transition-colors hover:text-cream">
                Traccia il tuo Ordine
              </Link>
              <span className="cursor-default">Spedizioni &amp; Resi</span>
              <span className="cursor-default">Contattaci</span>
              <span className="cursor-default">Termini &amp; Privacy</span>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-1 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Lynux Profumi. Tutti i diritti riservati.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Progetto demo di portfolio — nessun pagamento reale viene elaborato.
          </p>
        </div>
      </div>
    </footer>
  );
}
