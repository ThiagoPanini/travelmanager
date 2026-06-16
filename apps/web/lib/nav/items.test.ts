import { describe, expect, it } from "vitest";

import { isNavActive, NAV_ITEMS, tabbarItems } from "./items";

describe("navegação do AppShell", () => {
  it("cobre as cinco seções logadas na ordem da sidebar", () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual([
      "Visão geral",
      "Viagens",
      "Tarefas",
      "Atividade",
      "Notificações",
    ]);
  });

  it("ativa o item quando a rota é exatamente o href", () => {
    expect(isNavActive("/trips", "/trips")).toBe(true);
  });

  it("ativa o item quando a rota é um sub-caminho", () => {
    expect(isNavActive("/trips", "/trips/123/stops")).toBe(true);
  });

  it("não ativa por prefixo de string sem fronteira de caminho", () => {
    expect(isNavActive("/trip", "/trips")).toBe(false);
  });

  it("não confunde seções irmãs", () => {
    expect(isNavActive("/tasks", "/trips/123")).toBe(false);
  });

  it("monta a tabbar com cinco itens incluindo Perfil e sem Atividade", () => {
    const labels = tabbarItems().map((i) => i.label);
    expect(labels).toHaveLength(5);
    expect(labels).toContain("Perfil");
    expect(labels).not.toContain("Atividade");
  });
});
