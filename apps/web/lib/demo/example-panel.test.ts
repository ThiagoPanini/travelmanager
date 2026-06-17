import { describe, expect, it } from "vitest";

import { EXAMPLE_PANEL_DATA } from "./example-panel";

// Fixture estática do Painel de exemplo (DemoOverlay #137). Derivada 1:1 do
// `ttSeed` do protótipo (Eurotrip do grupo: GRU→LIS→CDG→FCO→GRU, 4 viajantes,
// GRU→LIS já com a Escolhida, demais Trajetos pendentes). Roda pelo mesmo
// `buildPanelData` das telas reais — sem API, sem sessão, sem seed de banco.
// Estes testes pinam que o exemplo nasce coerente e respeita o glossário.

describe("fixture do Painel de exemplo", () => {
  it("monta o herói da Eurotrip com a rota completa", () => {
    const hero = EXAMPLE_PANEL_DATA.hero;
    expect(hero).not.toBeNull();
    expect(hero?.name).toBe("Eurotrip do grupo");
    expect(hero?.routeCodes).toEqual(["GRU", "LIS", "CDG", "FCO", "GRU"]);
    // GRU→LIS decidido; LIS→CDG, CDG→FCO, FCO→GRU pendentes → 1 de 4.
    expect(hero?.legsTotal).toBe(4);
    expect(hero?.legsChosen).toBe(1);
  });

  it("deriva o que precisa de mim a partir das pendências de Trajeto", () => {
    const { alerts } = EXAMPLE_PANEL_DATA;
    expect(alerts).toHaveLength(3);
    expect(alerts.map((a) => a.title)).toContain("Marcar a Preferida");
    expect(alerts.some((a) => a.sub.includes("LIS → CDG"))).toBe(true);
    // pendência de Roteiro (Parada sem itinerário) não vira alerta do Painel.
    expect(alerts.some((a) => a.sub.includes("Roma"))).toBe(false);
  });

  it("mostra o orçamento por moeda, sem conversão (Invariante 15)", () => {
    const budget = EXAMPLE_PANEL_DATA.budget;
    expect(budget).not.toBeNull();
    expect(budget?.rows.map((r) => r.currency)).toEqual(["BRL", "EUR"]);
    // duas moedas distintas, jamais somadas: o herói lista ambas lado a lado.
    expect(EXAMPLE_PANEL_DATA.hero?.perPersonLabel).toContain("·");
  });

  it("não usa termos proibidos do glossário", () => {
    const serialized = JSON.stringify(EXAMPLE_PANEL_DATA);
    for (const term of [/\bvoos?\b/i, /\bproposta/i, /\betapa/i, /\blike\b/i]) {
      expect(serialized).not.toMatch(term);
    }
  });
});
