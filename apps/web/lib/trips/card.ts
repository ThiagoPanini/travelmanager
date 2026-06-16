import type { IconName } from "@/components/atlas";

import type { PendingItem } from "../dashboard/pending";
import { dateOnly } from "../format/date";

export type TripStatus = "planning" | "upcoming" | "ongoing" | "done";

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  planning: "em planejamento",
  upcoming: "confirmada",
  ongoing: "em viagem",
  done: "concluída",
};

// Dias inteiros de hoje até a data (negativo = no passado). Datas são YYYY-MM-DD.
function daysUntil(iso: string | null, todayIso: string): number | null {
  const target = dateOnly(iso);
  const today = dateOnly(todayIso);
  if (!target || !today) return null;
  const diff = new Date(`${target}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime();
  return Math.round(diff / 86_400_000);
}

// Status da Viagem derivado das datas vs. hoje (espelha o protótipo):
// terminou → done; hoje dentro do período → ongoing; futura com Paradas → upcoming;
// caso contrário (futura sem Paradas, ou sem datas) → planning.
export function tripStatus(
  startDate: string | null,
  endDate: string | null,
  hasStops: boolean,
  todayIso: string,
): TripStatus {
  const start = daysUntil(startDate, todayIso);
  const end = daysUntil(endDate, todayIso);
  if (end !== null && end < 0) return "done";
  if (start !== null && end !== null && start <= 0 && end >= 0) return "ongoing";
  if (!hasStops) return "planning";
  if (start === null || end === null) return "planning";
  return "upcoming";
}

export interface TripProgress {
  legsTotal: number;
  legsChosen: number;
  stopsTotal: number;
  stopsWithItinerary: number;
  /** Há Trajetos e todos têm a Escolhida marcada. */
  allDecided: boolean;
}

// Progresso da Viagem a partir das Paradas e das pendências (#58), sem N+1:
// Trajetos são derivados da sequência origem→paradas→origem (Paradas + 1);
// um Trajeto conta como "a decidir" se está sem Pesquisa ou sem Escolhida.
export function tripProgress(stopCount: number, pending: PendingItem[]): TripProgress {
  const legsTotal = stopCount >= 1 ? stopCount + 1 : 0;
  const undecidedLegs = pending.filter(
    (p) => p.kind === "leg_without_fare" || p.kind === "fare_without_chosen",
  ).length;
  const legsChosen = Math.max(0, legsTotal - undecidedLegs);
  const stopsWithoutItinerary = pending.filter((p) => p.kind === "stop_without_itinerary").length;
  return {
    legsTotal,
    legsChosen,
    stopsTotal: stopCount,
    stopsWithItinerary: Math.max(0, stopCount - stopsWithoutItinerary),
    allDecided: legsTotal > 0 && legsChosen === legsTotal,
  };
}

export interface SuggestedAction {
  text: string;
  href: string;
  icon: IconName;
}

// Próximo passo acionável da Viagem (espelha o protótipo), por ordem de prioridade:
// concluída → nada; sem Paradas → criar a primeira; senão a pendência mais "quente"
// (decidir Escolhida > pesquisar passagem > montar Roteiro); nada pendente → encaminhado.
export function suggestedAction(
  tripId: string,
  status: TripStatus,
  stopCount: number,
  pending: PendingItem[],
): SuggestedAction | null {
  if (status === "done") return null;
  if (stopCount === 0) {
    return { text: "Adicionar a primeira parada", href: `/trips/${tripId}`, icon: "pin" };
  }
  const decide = pending.find((p) => p.kind === "fare_without_chosen");
  if (decide) return { text: `Decidir ${decide.target}`, href: decide.href, icon: "compass" };
  const fare = pending.find((p) => p.kind === "leg_without_fare");
  if (fare) return { text: `Pesquisar passagem ${fare.target}`, href: fare.href, icon: "plane" };
  const itinerary = pending.find((p) => p.kind === "stop_without_itinerary");
  if (itinerary) {
    return {
      text: `Montar roteiro ${itinerary.target}`,
      href: itinerary.href,
      icon: "checkSquare",
    };
  }
  return { text: "Tudo encaminhado", href: `/trips/${tripId}`, icon: "check" };
}
