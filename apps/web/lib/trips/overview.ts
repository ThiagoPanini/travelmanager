import type { LegPublic, StopPublic } from "@traveltogether/types";

export interface TripOverview {
  stopCount: number;
  legCount: number;
  /** Trajetos com Escolhida marcada. */
  chosenCount: number;
  /** Trajetos ainda sem Escolhida (a decidir). */
  pendingCount: number;
  /** Há trajetos e todos têm Escolhida. */
  allDecided: boolean;
}

/** Resumo da Visão geral: contagem de Paradas/Trajetos e estado de decisão das Escolhidas. */
export function buildTripOverview(
  stops: StopPublic[],
  legs: LegPublic[],
  chosenByLeg: Record<string, boolean>,
): TripOverview {
  const chosenCount = legs.filter((leg) => chosenByLeg[leg.id]).length;
  const pendingCount = legs.length - chosenCount;
  return {
    stopCount: stops.length,
    legCount: legs.length,
    chosenCount,
    pendingCount,
    allDecided: legs.length > 0 && pendingCount === 0,
  };
}
