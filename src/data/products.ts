import type { Concentration, Product, ProductSize } from "@/types/product";

function buildSizes(
  concentration: Concentration,
  price100: number,
): ProductSize[] {
  const ratio50 = concentration === "Extrait de Parfum" ? 0.68 : 0.7;
  const sample = Math.round(price100 * (concentration === "Extrait de Parfum" ? 0.135 : 0.14));
  const size50 = Math.round(price100 * ratio50);

  return [
    { ml: 10, label: "Sample Kit (10ml)", price: sample },
    { ml: 50, label: "50ml", price: size50 },
    { ml: 100, label: "100ml", price: price100 },
  ];
}

export const products: Product[] = [
  {
    id: "1",
    slug: "lynux-noir",
    name: "Lynux Noir",
    tagline: "L'oscurità che seduce",
    description:
      "Un oud avvolgente incontra l'ambra grigia e il calore speziato del cardamomo nero, per una fragranza intensa e magnetica che non passa inosservata.",
    story:
      "Nato da un viaggio immaginario tra i souq notturni e le distillerie di Ta'if, Lynux Noir è la firma olfattiva di chi non cerca il consenso, ma il ricordo indelebile. Ogni goccia è un atto di presenza.",
    family: "Orientali",
    gender: "Unisex",
    concentration: "Extrait de Parfum",
    notes: {
      top: ["Cardamomo Nero", "Zenzero Nero", "Bergamotto Fumé"],
      heart: ["Rosa d'Oud", "Incenso", "Pepe di Sichuan"],
      base: ["Legno di Oud", "Ambra Grigia", "Muschio Bianco"],
    },
    sizes: buildSizes("Extrait de Parfum", 245),
    bestseller: true,
    popularity: 98,
    accent: "#D4AF37",
    accentSoft: "#5A2A2A",
    stockUnits: 42,
  },
  {
    id: "2",
    slug: "velvet-amber",
    name: "Velvet Amber",
    tagline: "Il calore che avvolge",
    description:
      "Zafferano prezioso e vaniglia bourbon si stendono su un fondo di tabacco biondo, in una composizione ambrata densa come velluto al tramonto.",
    story:
      "Velvet Amber nasce da un ricordo d'infanzia: la scatola di sigari del nonno, aperta di rado, custodita come un tesoro. Un profumo che porta l'eleganza sobria di un'altra epoca nel presente.",
    family: "Ambrati",
    gender: "Uomo",
    concentration: "Eau de Parfum",
    notes: {
      top: ["Zafferano", "Mandarino", "Cannella"],
      heart: ["Fiore di Tabacco", "Benzoino", "Iris"],
      base: ["Vaniglia Bourbon", "Tabacco Biondo", "Fava Tonka"],
    },
    sizes: buildSizes("Eau de Parfum", 195),
    bestseller: false,
    popularity: 84,
    accent: "#C5793B",
    accentSoft: "#3A2412",
    stockUnits: 76,
  },
  {
    id: "3",
    slug: "santal-imperial",
    name: "Santal Imperial",
    tagline: "La quiete regale del legno",
    description:
      "Il sandalo di Mysore, cremoso e lattiginoso, si intreccia con l'iris pallida e il cuoio italiano in un accordo legnoso di rara raffinatezza.",
    story:
      "Santal Imperial è un omaggio alle botteghe artigiane di pelletteria fiorentina, dove il profumo del cuoio conciato al vegetale incontra la polvere preziosa dell'iris. Discreto, mai urlato.",
    family: "Legnosi",
    gender: "Unisex",
    concentration: "Extrait de Parfum",
    notes: {
      top: ["Cardamomo Verde", "Bergamotto", "Zafferano"],
      heart: ["Iris Pallida", "Rosa di Maggio", "Violetta"],
      base: ["Sandalo di Mysore", "Cuoio Italiano", "Muschio d'Ambra"],
    },
    sizes: buildSizes("Extrait de Parfum", 260),
    bestseller: true,
    popularity: 95,
    accent: "#C9A66B",
    accentSoft: "#4A3B2A",
    stockUnits: 18,
  },
  {
    id: "4",
    slug: "citrus-mirage",
    name: "Citrus Mirage",
    tagline: "Il miraggio luminoso degli agrumi",
    description:
      "Bergamotto di Calabria e neroli si aprono su un cuore di fiori d'arancio, sorretti da un vetiver di Haiti terroso che ancora la composizione.",
    story:
      "Citrus Mirage cattura l'istante in cui il sole colpisce un agrumeto calabrese all'alba: luminoso, vibrante, mai banale. Una freschezza che dura, grazie alla profondità del vetiver.",
    family: "Agrumati",
    gender: "Unisex",
    concentration: "Eau de Parfum",
    notes: {
      top: ["Bergamotto di Calabria", "Limone di Sicilia", "Petit Grain"],
      heart: ["Neroli", "Fiori d'Arancio", "Gelsomino"],
      base: ["Vetiver di Haiti", "Muschio Bianco", "Ambretta"],
    },
    sizes: buildSizes("Eau de Parfum", 175),
    isNew: true,
    popularity: 76,
    accent: "#B7C36B",
    accentSoft: "#2E3A22",
    stockUnits: 95,
  },
  {
    id: "5",
    slug: "rose-imperiale",
    name: "Rose Impériale",
    tagline: "La rosa che non chiede permesso",
    description:
      "Rosa Damascena e pepe rosa si fondono in un accordo speziato e sfaccettato, sostenuto da un patchouli scuro che dona profondità e carattere.",
    story:
      "Rose Impériale reinterpreta la rosa lontano dal cliché: non un fiore delicato, ma una dichiarazione. Il pepe rosa la rende tagliente, il patchouli scuro la rende indimenticabile.",
    family: "Speziati",
    gender: "Donna",
    concentration: "Eau de Parfum",
    notes: {
      top: ["Pepe Rosa", "Lampone", "Bergamotto"],
      heart: ["Rosa Damascena", "Peonia", "Litchi"],
      base: ["Patchouli Scuro", "Muschio", "Legno di Cashmere"],
    },
    sizes: buildSizes("Eau de Parfum", 205),
    bestseller: true,
    popularity: 91,
    accent: "#C97B8C",
    accentSoft: "#4A1F2B",
    stockUnits: 33,
  },
  {
    id: "6",
    slug: "solaris-ether",
    name: "Solaris Ether",
    tagline: "L'incenso sospeso nella luce",
    description:
      "Incenso e salvia sclarea si elevano su una base di cedro dell'Atlas, in una fragranza eterea e contemplativa, quasi liturgica nella sua purezza.",
    story:
      "Ispirato alle prime luci filtrate tra le colonne di un tempio, Solaris Ether è pensato per i momenti di raccoglimento: una scia che accompagna senza mai sovrastare.",
    family: "Legnosi",
    gender: "Unisex",
    concentration: "Extrait de Parfum",
    notes: {
      top: ["Salvia Sclarea", "Bergamotto", "Elemi"],
      heart: ["Incenso", "Iris", "Geranio"],
      base: ["Cedro dell'Atlas", "Ambra Grigia", "Vetiver"],
    },
    sizes: buildSizes("Extrait de Parfum", 250),
    isNew: true,
    popularity: 72,
    accent: "#C0763F",
    accentSoft: "#33352A",
    stockUnits: 61,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  const sameFamily = products.filter(
    (candidate) => candidate.family === product.family && candidate.id !== product.id,
  );
  const rest = products.filter(
    (candidate) => candidate.family !== product.family && candidate.id !== product.id,
  );
  return [...sameFamily, ...rest].slice(0, limit);
}

export const olfactoryFamilies: Product["family"][] = [
  "Legnosi",
  "Speziati",
  "Orientali",
  "Agrumati",
  "Ambrati",
];

export const genders: Product["gender"][] = ["Unisex", "Uomo", "Donna"];

export const concentrations: Product["concentration"][] = [
  "Extrait de Parfum",
  "Eau de Parfum",
];
