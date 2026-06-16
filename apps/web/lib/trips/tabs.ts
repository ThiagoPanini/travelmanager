export const TRIP_TABS = ["overview", "budget", "tasks", "schedule", "mural"] as const;

export type TripTab = (typeof TRIP_TABS)[number];

export const DEFAULT_TRIP_TAB: TripTab = "overview";

export const TRIP_TAB_LABELS: Record<TripTab, string> = {
  overview: "Visão geral",
  budget: "Orçamento",
  tasks: "Tarefas",
  schedule: "Cronograma",
  mural: "Mural",
};

function isTripTab(value: string): value is TripTab {
  return (TRIP_TABS as readonly string[]).includes(value);
}

/** Deriva a aba ativa do segmento de rota; aba ausente ou inválida cai na Visão geral. */
export function resolveTripTab(raw: string | string[] | undefined): TripTab {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (slug && isTripTab(slug)) return slug;
  return DEFAULT_TRIP_TAB;
}

/** Visão geral mora na raiz da Viagem; as demais abas em /trips/:id/t/:tab. */
export function tripTabHref(tripId: string, tab: TripTab): string {
  if (tab === DEFAULT_TRIP_TAB) return `/trips/${tripId}`;
  return `/trips/${tripId}/t/${tab}`;
}
