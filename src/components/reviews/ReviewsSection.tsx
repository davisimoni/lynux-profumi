"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MessageSquarePlus, PenLine } from "lucide-react";
import { StarRating } from "@/components/reviews/StarRating";
import { ScentMeter } from "@/components/reviews/ScentMeter";
import { Slider } from "@/components/ui/slider";
import {
  aggregateReviews,
  LONGEVITY_LABELS,
  SILLAGE_LABELS,
  type Review,
} from "@/lib/reviews/types";

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

const EMPTY_FORM = {
  authorName: "",
  rating: 5,
  sillage: 3,
  longevity: 3,
  body: "",
};

export function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((response) => response.json())
      .then((data: { reviews: Review[] }) => {
        if (!cancelled) setReviews(data.reviews ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const aggregate = useMemo(() => aggregateReviews(reviews), [reviews]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.body.trim().length < 10) {
      toast.error("La recensione deve contenere almeno 10 caratteri.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });

      if (!response.ok) {
        toast.error("Non è stato possibile pubblicare la recensione.");
        return;
      }

      const { review } = (await response.json()) as { review: Review };
      setReviews((prev) => [review, ...prev]);
      setForm(EMPTY_FORM);
      setFormOpen(false);
      toast.success("Recensione pubblicata", { description: `Grazie, ${review.authorName}.` });
    } catch {
      toast.error("Errore di rete. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-luxe text-gold">Voci di chi ha già scoperto</p>
          <h2 className="font-display text-3xl font-light text-cream">
            Recensioni su {productName}
          </h2>
        </div>

        <div className="mt-10 grid gap-8 rounded-md border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:p-8">
          <div className="flex flex-col items-center justify-center gap-2 sm:border-r sm:border-border sm:pr-8">
            <span className="font-display text-5xl text-gold">
              {aggregate.count > 0 ? aggregate.averageRating.toFixed(1) : "—"}
            </span>
            <StarRating value={Math.round(aggregate.averageRating)} size="md" />
            <span className="text-xs text-muted-foreground">
              {aggregate.count} {aggregate.count === 1 ? "recensione" : "recensioni"}
            </span>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <ScentMeter
              label="Scia"
              value={aggregate.averageSillage}
              descriptor={
                aggregate.count > 0 ? SILLAGE_LABELS[Math.round(aggregate.averageSillage) - 1] : undefined
              }
            />
            <ScentMeter
              label="Durata"
              value={aggregate.averageLongevity}
              descriptor={
                aggregate.count > 0
                  ? LONGEVITY_LABELS[Math.round(aggregate.averageLongevity) - 1]
                  : undefined
              }
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="flex items-center gap-2 rounded-sm border border-gold px-6 py-3 text-xs uppercase tracking-luxe text-gold transition-colors hover:bg-gold hover:text-obsidian cursor-pointer"
          >
            <PenLine className="h-3.5 w-3.5" />
            {formOpen ? "Annulla" : "Scrivi una Recensione"}
          </button>
        </div>

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-xl space-y-5 rounded-md border border-border bg-card p-6"
          >
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
                Il tuo nome
              </label>
              <input
                required
                maxLength={60}
                value={form.authorName}
                onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
                className="w-full rounded-sm border border-border bg-transparent px-3.5 py-2.5 text-sm text-cream outline-none transition-colors focus:border-gold"
                placeholder="es. Giulia F."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
                Valutazione complessiva
              </label>
              <StarRating
                value={form.rating}
                onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
                size="md"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Scia
                </label>
                <span className="text-xs text-gold">{SILLAGE_LABELS[form.sillage - 1]}</span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[form.sillage]}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, sillage: (value as number[])[0] }))
                }
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Durata
                </label>
                <span className="text-xs text-gold">{LONGEVITY_LABELS[form.longevity - 1]}</span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[form.longevity]}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, longevity: (value as number[])[0] }))
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
                La tua recensione
              </label>
              <textarea
                required
                minLength={10}
                maxLength={600}
                rows={4}
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                className="w-full resize-none rounded-sm border border-border bg-transparent px-3.5 py-2.5 text-sm text-cream outline-none transition-colors focus:border-gold"
                placeholder="Come si è evoluto sulla tua pelle? In quali occasioni lo indossi?"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-gold py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              <MessageSquarePlus className="h-4 w-4" />
              {submitting ? "Pubblicazione…" : "Pubblica Recensione"}
            </button>
          </form>
        )}

        {loading && (
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Caricamento recensioni…
          </p>
        )}

        <ul className="mt-10 space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-border pb-6 last:border-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-display text-base text-cream">{review.authorName}</span>
                  <StarRating value={review.rating} />
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:gap-8">
                <ScentMeter label="Scia" value={review.sillage} />
                <ScentMeter label="Durata" value={review.longevity} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
