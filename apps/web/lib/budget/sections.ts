import type {
  BudgetSummary,
  ExtraPublic,
  FareQuotePublic,
  LegPublic,
  LodgingPublic,
  RateioBasis,
  StopPublic,
} from "@traveltogether/types";

export interface FareLine {
  legId: string;
  order: number;
  label: string;
  /** `null` = sem Escolhida → lacuna "a decidir". */
  chosen: FareQuotePublic | null;
}

export interface LodgingLine {
  id: string;
  stopLabel: string;
  description: string;
  nightlyValue: string;
  currency: string;
  basis: RateioBasis;
  nights: number;
}

export interface ExtraLine {
  id: string;
  description: string;
  value: string;
  currency: string;
  basis: RateioBasis;
}

export interface SubtotalLine {
  currency: string;
  perGroup: string;
  perPerson: string;
}

export interface BudgetSections {
  fares: FareLine[];
  lodgings: LodgingLine[];
  extras: ExtraLine[];
  subtotals: SubtotalLine[];
  memberCount: number;
  hasFareGaps: boolean;
  isEmpty: boolean;
}

export interface BudgetSectionsInput {
  originCity: string;
  stops: StopPublic[];
  legs: LegPublic[];
  chosenFaresByLeg: Record<string, FareQuotePublic | null>;
  lodgings: LodgingPublic[];
  extras: ExtraPublic[];
  summary: BudgetSummary | null;
}

/** Rótulo pt-BR da base de rateio (ADR-0016): valor já por pessoa vs. valor do grupo a dividir. */
export function rateioLabel(basis: RateioBasis): string {
  return basis === "per_person" ? "por pessoa" : "rateado no grupo";
}

/** Noites entre chegada e partida da Parada (datas podem vir como datetime). 0 se faltam datas. */
function nightsBetween(arrival: string | null, departure: string | null): number {
  if (!arrival || !departure) return 0;
  const start = Date.parse(arrival.slice(0, 10));
  const end = Date.parse(departure.slice(0, 10));
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  const diff = Math.round((end - start) / 86_400_000);
  return diff > 0 ? diff : 0;
}

export function buildBudgetSections(input: BudgetSectionsInput): BudgetSections {
  const { originCity, stops, legs, chosenFaresByLeg, lodgings, extras, summary } = input;

  const stopById: Record<string, StopPublic> = {};
  for (const s of stops) stopById[s.id] = s;

  const sortedLegs = [...legs].sort((a, b) => a.order - b.order);
  const fares: FareLine[] = sortedLegs.map((leg) => {
    const fromCity = leg.origin_stop_id
      ? (stopById[leg.origin_stop_id]?.city ?? originCity)
      : originCity;
    const toCity = leg.destination_stop_id
      ? (stopById[leg.destination_stop_id]?.city ?? originCity)
      : originCity;
    return {
      legId: leg.id,
      order: leg.order,
      label: `${fromCity} → ${toCity}`,
      chosen: chosenFaresByLeg[leg.id] ?? null,
    };
  });

  const lodgingLines: LodgingLine[] = lodgings.map((l) => {
    const anchor = stopById[l.stop_id];
    return {
      id: l.id,
      stopLabel: anchor?.city ?? "Parada removida",
      description: l.description,
      nightlyValue: l.nightly_value,
      currency: l.currency,
      basis: l.basis,
      nights: anchor ? nightsBetween(anchor.arrival_date, anchor.departure_date) : 0,
    };
  });

  const extraLines: ExtraLine[] = extras.map((e) => ({
    id: e.id,
    description: e.description,
    value: e.value,
    currency: e.currency,
    basis: e.basis,
  }));

  const subtotals: SubtotalLine[] = (summary?.subtotals ?? []).map((s) => ({
    currency: s.currency,
    perGroup: s.per_group,
    perPerson: s.per_person,
  }));

  const hasChosen = fares.some((f) => f.chosen !== null);

  return {
    fares,
    lodgings: lodgingLines,
    extras: extraLines,
    subtotals,
    memberCount: summary?.member_count ?? 0,
    hasFareGaps: fares.some((f) => f.chosen === null),
    isEmpty: !hasChosen && lodgingLines.length === 0 && extraLines.length === 0,
  };
}
