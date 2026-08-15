const PRESS_QUOTES = [
  { quote: "The epitome of dark luxury perfumery.", source: "GQ" },
  { quote: "A niche house that dares to be unforgettable.", source: "Vogue" },
  { quote: "Not a fragrance — a statement of presence.", source: "Esquire" },
  { quote: "Scents you remember, never scents you forget.", source: "Elle" },
];

export function PressStrip() {
  return (
    <section className="border-b border-border bg-obsidian-raised">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="mb-10 text-center text-[11px] uppercase tracking-luxe text-muted-foreground">
          As Seen In
        </p>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {PRESS_QUOTES.map(({ quote, source }) => (
            <figure key={source} className="text-center">
              <blockquote className="font-display text-lg font-semibold leading-snug text-cream sm:text-xl">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-[11px] uppercase tracking-luxe text-gold">
                {source}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
