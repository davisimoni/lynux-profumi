import type { OlfactoryNotes } from "@/types/product";

export interface ProductTranslation {
  tagline: string;
  description: string;
  story: string;
  notes: OlfactoryNotes;
}

/**
 * English overrides for the display-only prose fields of each product.
 * `family`/`gender`/`concentration` are never translated here — they stay
 * canonical Italian in the base product record, since business logic
 * (catalog filters, quiz scoring, admin metrics) matches on those exact
 * values. Only their rendered labels are translated, via the dictionary's
 * `families`/`genders`/`concentrations` maps.
 */
export const productTranslations: Record<string, ProductTranslation> = {
  "1": {
    tagline: "The darkness that seduces",
    description:
      "An enveloping oud meets grey amber and the spiced warmth of black cardamom, for an intense, magnetic fragrance that never goes unnoticed.",
    story:
      "Born from an imagined journey through the night souks and the distilleries of Ta'if, Lynux Noir is the olfactory signature of those who seek not approval, but an indelible memory. Every drop is an act of presence.",
    notes: {
      top: ["Black Cardamom", "Black Ginger", "Smoked Bergamot"],
      heart: ["Oud Rose", "Incense", "Sichuan Pepper"],
      base: ["Oud Wood", "Grey Amber", "White Musk"],
    },
  },
  "2": {
    tagline: "The warmth that envelops",
    description:
      "Precious saffron and bourbon vanilla unfold over a base of blond tobacco, in an amber composition as dense as velvet at sunset.",
    story:
      "Velvet Amber is born from a childhood memory: grandfather's cigar box, rarely opened, kept like a treasure. A fragrance that carries the sober elegance of another era into the present.",
    notes: {
      top: ["Saffron", "Mandarin", "Cinnamon"],
      heart: ["Tobacco Flower", "Benzoin", "Iris"],
      base: ["Bourbon Vanilla", "Blond Tobacco", "Tonka Bean"],
    },
  },
  "3": {
    tagline: "The regal stillness of wood",
    description:
      "Mysore sandalwood, creamy and milky, intertwines with pale iris and Italian leather in a woody accord of rare refinement.",
    story:
      "Santal Imperial pays homage to the artisan leather workshops of Florence, where the scent of vegetable-tanned leather meets the precious powder of iris. Discreet, never loud.",
    notes: {
      top: ["Green Cardamom", "Bergamot", "Saffron"],
      heart: ["Iris Pallida", "May Rose", "Violet"],
      base: ["Mysore Sandalwood", "Italian Leather", "Amber Musk"],
    },
  },
  "4": {
    tagline: "The luminous mirage of citrus",
    description:
      "Calabrian bergamot and neroli open onto a heart of orange blossom, supported by an earthy Haitian vetiver that anchors the composition.",
    story:
      "Citrus Mirage captures the instant the sun strikes a Calabrian citrus grove at dawn: luminous, vibrant, never banal. A freshness that lasts, thanks to the depth of vetiver.",
    notes: {
      top: ["Calabrian Bergamot", "Sicilian Lemon", "Petit Grain"],
      heart: ["Neroli", "Orange Blossom", "Jasmine"],
      base: ["Haitian Vetiver", "White Musk", "Ambrette"],
    },
  },
  "5": {
    tagline: "The rose that asks no permission",
    description:
      "Damascena rose and pink pepper merge into a spiced, multifaceted accord, sustained by a dark patchouli that lends depth and character.",
    story:
      "Rose Impériale reinterprets the rose far from cliché: not a delicate flower, but a statement. Pink pepper makes it sharp, dark patchouli makes it unforgettable.",
    notes: {
      top: ["Pink Pepper", "Raspberry", "Bergamot"],
      heart: ["Damascena Rose", "Peony", "Lychee"],
      base: ["Dark Patchouli", "Musk", "Cashmere Wood"],
    },
  },
  "6": {
    tagline: "Incense suspended in light",
    description:
      "Incense and clary sage rise over a base of Atlas cedar, in an ethereal, contemplative fragrance, almost liturgical in its purity.",
    story:
      "Inspired by the first light filtering between a temple's columns, Solaris Ether is designed for moments of reflection: a trail that accompanies without ever overpowering.",
    notes: {
      top: ["Clary Sage", "Bergamot", "Elemi"],
      heart: ["Incense", "Iris", "Geranium"],
      base: ["Atlas Cedar", "Grey Amber", "Vetiver"],
    },
  },
};
