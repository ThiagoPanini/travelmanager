import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TabChip } from "./tab-chip";

describe("TabChip", () => {
  it("a vista atual é anunciada com aria-current='page'", () => {
    render(<TabChip state="active">Painel</TabChip>);
    expect(screen.getByText("Painel")).toHaveAttribute("aria-current", "page");
  });

  it("a casca em breve é aria-disabled, não-focável e diz 'em breve' ao leitor de tela", () => {
    render(<TabChip state="soon">Roteiro</TabChip>);
    const chip = screen.getByText(/roteiro/i);
    expect(chip).toHaveAttribute("aria-disabled", "true");
    expect(chip).not.toHaveAttribute("tabindex");
    // sufixo "em breve" presente no texto (visualmente escondido por .sr-only)
    expect(chip).toHaveTextContent(/roteiro\s*\(em breve\)/i);
  });
});
