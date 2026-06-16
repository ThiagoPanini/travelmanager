import { describe, expect, it } from "vitest";

import { DEFAULT_TRIP_TAB, resolveTripTab, TRIP_TABS, tripTabHref } from "./tabs";

describe("resolveTripTab", () => {
  it("retorna a aba quando o slug é válido", () => {
    expect(resolveTripTab("budget")).toBe("budget");
  });

  it("faz fallback para visão geral quando ausente", () => {
    expect(resolveTripTab(undefined)).toBe(DEFAULT_TRIP_TAB);
  });

  it("faz fallback para visão geral quando o slug é inválido", () => {
    expect(resolveTripTab("inexistente")).toBe("overview");
  });

  it("aceita array de params (catch-all) usando o primeiro segmento", () => {
    expect(resolveTripTab(["schedule"])).toBe("schedule");
  });
});

describe("tripTabHref", () => {
  it("aponta a visão geral para a raiz da Viagem", () => {
    expect(tripTabHref("t1", "overview")).toBe("/trips/t1");
  });

  it("aponta as demais abas para /t/:tab", () => {
    expect(tripTabHref("t1", "mural")).toBe("/trips/t1/t/mural");
  });
});

describe("TRIP_TABS", () => {
  it("lista as cinco superfícies na ordem do produto", () => {
    expect(TRIP_TABS).toEqual(["overview", "budget", "tasks", "schedule", "mural"]);
  });
});
