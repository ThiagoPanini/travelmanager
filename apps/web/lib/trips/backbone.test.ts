import { describe, expect, it } from "vitest";
import {
  daysUntilDeparture,
  departureCountdown,
  formatTripDate,
  type StopRead,
  summarizeSharedTransfers,
} from "./backbone";

/** Parada mínima para os cenários de translado compartilhado. */
function stop(partial: Partial<StopRead> & { position: number }): StopRead {
  return {
    id: `s${partial.position}`,
    city: "Cidade",
    country: "BR",
    arrival_date: null,
    desired_transfer: null,
    ...partial,
  };
}

describe("formatTripDate (data de partida legível)", () => {
  it("formata YYYY-MM-DD como '14 set 2026' (sem 'de', sem ponto)", () => {
    expect(formatTripDate("2026-09-14")).toBe("14 set 2026");
  });

  it("preenche o dia com zero à esquerda", () => {
    expect(formatTripDate("2026-07-01")).toBe("01 jul 2026");
  });

  it("retorna null quando a data é nula ou malformada", () => {
    expect(formatTripDate(null)).toBeNull();
    expect(formatTripDate("amanhã")).toBeNull();
  });
});

describe("daysUntilDeparture (contador de embarque, null-safe)", () => {
  it("conta os dias entre hoje e a partida, ignorando a hora do dia", () => {
    // given: hoje 1 jul (com hora cheia) e partida em 8 jul
    const today = new Date(2026, 6, 1, 23, 30);
    // then: 7 dias, não 6 — a hora não desconta um dia
    expect(daysUntilDeparture("2026-07-08", today)).toBe(7);
  });

  it("é 0 no próprio dia da partida", () => {
    expect(daysUntilDeparture("2026-07-01", new Date(2026, 6, 1, 9, 0))).toBe(0);
  });

  it("retorna null quando não há data de partida", () => {
    expect(daysUntilDeparture(null, new Date(2026, 6, 1))).toBeNull();
  });
});

describe("departureCountdown (bloco de embarque do herói)", () => {
  const today = new Date(2026, 6, 1);

  it("conta os dias e pluraliza o caption", () => {
    expect(departureCountdown("2026-07-08", today)).toEqual({
      number: "7",
      caption: "dias p/ embarque",
    });
    expect(departureCountdown("2026-07-02", today)).toEqual({
      number: "1",
      caption: "dia p/ embarque",
    });
  });

  it("é honesto nas pontas: hoje, já partiu e sem data", () => {
    expect(departureCountdown("2026-07-01", today)).toEqual({
      number: "hoje",
      caption: "embarque",
    });
    expect(departureCountdown("2026-06-20", today)).toEqual({ number: "—", caption: "já partiu" });
    expect(departureCountdown(null, today)).toEqual({ number: "—", caption: "datas a definir" });
  });
});

describe("summarizeSharedTransfers (avanço dos translados compartilhados)", () => {
  it("ignora a 1ª parada (ponta de entrada é por-pessoa, não compartilhada)", () => {
    // given: só o destino — nenhum salto compartilhado
    const result = summarizeSharedTransfers([stop({ position: 0, desired_transfer: null })]);
    // then: denominador zero, sem proposta nem aberto
    expect(result).toEqual({ proposed: 0, total: 0, open: 0 });
  });

  it("conta como proposto só o salto com tipo concreto (undecided/nulo ficam abertos)", () => {
    const result = summarizeSharedTransfers([
      stop({ position: 0 }),
      stop({ position: 1, desired_transfer: { kind: "train", other_text: null } }),
      stop({ position: 2, desired_transfer: { kind: "undecided", other_text: null } }),
      stop({ position: 3, desired_transfer: null }),
    ]);
    // then: 1 de 3 compartilhados proposto, 2 em discussão
    expect(result).toEqual({ proposed: 1, total: 3, open: 2 });
  });

  it("100% quando todos os compartilhados têm tipo concreto", () => {
    const result = summarizeSharedTransfers([
      stop({ position: 0 }),
      stop({ position: 1, desired_transfer: { kind: "plane", other_text: null } }),
      stop({ position: 2, desired_transfer: { kind: "bus", other_text: null } }),
    ]);
    expect(result).toEqual({ proposed: 2, total: 2, open: 0 });
  });
});
