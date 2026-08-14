import { Leaf, Gem, Gift, ShieldCheck } from "lucide-react";

const COMMITMENTS = [
  {
    icon: Leaf,
    title: "Cruelty-Free",
    description: "Nessun test sugli animali, in ogni fase della produzione.",
  },
  {
    icon: Gem,
    title: "Ingredienti Rari",
    description: "Materie prime selezionate da distillerie e coltivatori d'eccellenza.",
  },
  {
    icon: Gift,
    title: "Luxury Gift Box",
    description: "Ogni ordine arriva in confezione rigida, pronta per essere regalata.",
  },
  {
    icon: ShieldCheck,
    title: "Edizioni Discrete",
    description: "Lotti limitati, tracciabili, mai prodotti su scala di massa.",
  },
];

export function SocialProof() {
  return (
    <section className="bg-obsidian-raised">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COMMITMENTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-display text-base text-cream">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
