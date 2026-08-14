import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
      <p className="text-xs uppercase tracking-luxe text-gold">Errore 404</p>
      <h1 className="font-display text-4xl font-light text-cream">
        Questa essenza è svanita
      </h1>
      <p className="text-sm text-muted-foreground">
        La pagina che cerchi non esiste o è stata rimossa dalla collezione.
      </p>
      <Link
        href="/catalog"
        className="mt-4 rounded-sm border border-gold px-6 py-3 text-xs uppercase tracking-luxe text-gold transition-colors hover:bg-gold hover:text-obsidian"
      >
        Esplora le Fragranze
      </Link>
    </div>
  );
}
