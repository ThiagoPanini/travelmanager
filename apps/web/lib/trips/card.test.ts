import type { PendingActionKind } from "@traveltogether/types";
import { describe, expect, it } from "vitest";

import type { PendingItem } from "../dashboard/pending";
import { suggestedAction, tripProgress, tripStatus } from "./card";

const TODAY = "2026-06-16";

function pend(kind: PendingActionKind, target = "GRU → LIS"): PendingItem {
  const href =
    kind === "stop_without_itinerary" ? "/trips/t1/stops/s1/itinerary" : "/trips/t1/legs/l1";
  return { kind, verb: kind, target, tripId: "t1", tripName: "Eurotrip", href };
}

describe("tripStatus", () => {
  it("é 'done' quando a Viagem já terminou", () => {
    expect(tripStatus("2026-05-01", "2026-05-10", true, TODAY)).toBe("done");
  });

  it("é 'ongoing' quando hoje está dentro do período", () => {
    expect(tripStatus("2026-06-14", "2026-06-20", true, TODAY)).toBe("ongoing");
  });

  it("é 'upcoming' quando é futura e já tem Paradas", () => {
    expect(tripStatus("2026-07-01", "2026-07-10", true, TODAY)).toBe("upcoming");
  });

  it("é 'planning' quando é futura mas ainda sem Paradas", () => {
    expect(tripStatus("2026-07-01", "2026-07-10", false, TODAY)).toBe("planning");
  });

  it("é 'planning' quando faltam datas", () => {
    expect(tripStatus(null, null, true, TODAY)).toBe("planning");
  });
});

describe("tripProgress", () => {
  it("deriva total de Trajetos da sequência origem→paradas→origem", () => {
    // 3 Paradas → 4 Trajetos (origem→p1→p2→p3→origem)
    const p = tripProgress(3, []);
    expect(p.legsTotal).toBe(4);
    expect(p.stopsTotal).toBe(3);
  });

  it("não há Trajetos quando não há Paradas", () => {
    const p = tripProgress(0, []);
    expect(p.legsTotal).toBe(0);
    expect(p.allDecided).toBe(false);
  });

  it("conta como decididos os Trajetos sem pendência de Pesquisa/Escolhida", () => {
    // 2 Trajetos no total (1 Parada), 1 sem Escolhida → 1 decidido
    const p = tripProgress(1, [pend("fare_without_chosen")]);
    expect(p.legsTotal).toBe(2);
    expect(p.legsChosen).toBe(1);
    expect(p.allDecided).toBe(false);
  });

  it("trata Trajeto sem Pesquisa também como não decidido", () => {
    const p = tripProgress(1, [pend("leg_without_fare"), pend("fare_without_chosen")]);
    expect(p.legsChosen).toBe(0);
  });

  it("marca tudo decidido quando não há pendência de Trajeto", () => {
    const p = tripProgress(2, []);
    expect(p.legsChosen).toBe(3);
    expect(p.allDecided).toBe(true);
  });

  it("conta Paradas com Roteiro descontando as pendências de itinerário", () => {
    const p = tripProgress(3, [pend("stop_without_itinerary")]);
    expect(p.stopsWithItinerary).toBe(2);
  });
});

describe("suggestedAction", () => {
  it("não sugere nada para Viagem concluída", () => {
    expect(suggestedAction("t1", "done", 2, [])).toBeNull();
  });

  it("sugere adicionar a primeira Parada quando não há nenhuma", () => {
    const a = suggestedAction("t1", "planning", 0, []);
    expect(a).toEqual({ text: "Adicionar a primeira parada", href: "/trips/t1", icon: "pin" });
  });

  it("prioriza decidir a Escolhida sobre pesquisar passagem", () => {
    const a = suggestedAction("t1", "upcoming", 2, [
      pend("leg_without_fare", "GRU → CDG"),
      pend("fare_without_chosen", "GRU → LIS"),
    ]);
    expect(a).toEqual({ text: "Decidir GRU → LIS", href: "/trips/t1/legs/l1", icon: "compass" });
  });

  it("sugere pesquisar passagem quando só falta Pesquisa", () => {
    const a = suggestedAction("t1", "upcoming", 2, [pend("leg_without_fare", "GRU → CDG")]);
    expect(a).toEqual({
      text: "Pesquisar passagem GRU → CDG",
      href: "/trips/t1/legs/l1",
      icon: "plane",
    });
  });

  it("sugere montar Roteiro quando só falta itinerário", () => {
    const a = suggestedAction("t1", "upcoming", 2, [pend("stop_without_itinerary", "Lisboa")]);
    expect(a).toEqual({
      text: "Montar roteiro Lisboa",
      href: "/trips/t1/stops/s1/itinerary",
      icon: "checkSquare",
    });
  });

  it("diz que está tudo encaminhado quando não há pendência", () => {
    const a = suggestedAction("t1", "upcoming", 2, []);
    expect(a).toEqual({ text: "Tudo encaminhado", href: "/trips/t1", icon: "check" });
  });
});
