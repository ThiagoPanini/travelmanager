// Copy da landing (pt-BR, tom coletivo, metáfora de aviação).
// Constantes do projeto: nada de "whatsapp" nem "caça".

export const wordmark = "traveltogether";

export const tagline = "seu organizador de viagens";

export const eyebrow = "em experimentação";

export const heroTitle = {
  lead: "Organize sua viagem de maneira fácil em um",
  accent: "único lugar",
} as const;

export const heroSubtitle =
  "A aplicação que te ajuda a garantir que sua viagem seja bem organizada: de pesquisas de translados até registro de roteiro. Tudo o que você precisa está aqui";

export type Step = {
  number: string;
  glyph: string;
  title: string;
  body: string;
};

export const steps: Step[] = [
  {
    number: "01",
    glyph: "✦",
    title: "Cadastrem a viagem",
    body: "Datas, destino e quem vai. Um só lugar para o grupo inteiro.",
  },
  {
    number: "02",
    glyph: "◇",
    title: "Desenhem as paradas",
    body: "De cidade em cidade. Cada trajeto vira um trecho que o grupo organiza junto.",
  },
  {
    number: "03",
    glyph: "✈",
    title: "Pesquisem o translado",
    body: "Voo, carro ou ônibus entre cada parada. Comparem as opções e decidam juntos.",
  },
];

export const entrar = {
  label: "Entrar",
  href: "/login",
} as const;

export type RibbonLeg = { code: string; city: string };

export const ribbon = {
  label: "EUA Trip",
  meta: "4 viajantes · 14 set → 02 out 2026",
  legs: [
    { code: "GRU", city: "São Paulo" },
    { code: "JFK", city: "Nova York" },
    { code: "MIA", city: "Miami" },
    { code: "MCO", city: "Orlando" },
    { code: "GRU", city: "São Paulo" },
  ] as RibbonLeg[],
};

// Reunido para checagens de a11y/copy em teste.
export const allCopy: string[] = [
  wordmark,
  tagline,
  eyebrow,
  heroTitle.lead,
  heroTitle.accent,
  heroSubtitle,
  ...steps.flatMap((s) => [s.title, s.body]),
  entrar.label,
  ribbon.label,
  ribbon.meta,
  ...ribbon.legs.flatMap((l) => [l.code, l.city]),
];
