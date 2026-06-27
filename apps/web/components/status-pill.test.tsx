import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./status-pill";

describe("StatusPill", () => {
  it("mostra o texto do estado (o estado nunca depende só de cor)", () => {
    render(<StatusPill tone="warning">em discussão</StatusPill>);
    expect(screen.getByText("em discussão")).toBeInTheDocument();
  });

  it("aplica uma classe de tom distinta por semântica (cor + borda no CSS)", () => {
    const { rerender } = render(<StatusPill tone="accent">proposto: trem</StatusPill>);
    const accent = screen.getByText("proposto: trem").className;
    rerender(<StatusPill tone="muted">emerge na pesquisa</StatusPill>);
    const muted = screen.getByText("emerge na pesquisa").className;
    expect(accent).not.toBe(muted);
  });
});
