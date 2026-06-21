import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("Landing", () => {
  it("tem um único h1 de uma sentença com destaque em 'único lugar'", () => {
    render(<HomePage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/organize sua viagem de maneira fácil em um/i);
    expect(h1s[0]).toHaveTextContent(/único lugar/i);
  });

  it("mostra o wordmark traveltogether (sólido, sem separador)", () => {
    render(<HomePage />);
    expect(screen.getAllByText("traveltogether").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("travel·together")).not.toBeInTheDocument();
  });

  it("traz a sobrancelha 'em experimentação' e a tagline 'seu organizador de viagens'", () => {
    render(<HomePage />);
    expect(screen.getByText("em experimentação")).toBeInTheDocument();
    expect(screen.getByText("seu organizador de viagens")).toBeInTheDocument();
  });

  it("apresenta o subtítulo novo", () => {
    render(<HomePage />);
    expect(screen.getByText(/tudo o que você precisa está aqui/i)).toBeInTheDocument();
  });

  it("apresenta os três step cards sem o título 'Como funciona'", () => {
    render(<HomePage />);
    for (const title of ["Cadastrem a viagem", "Desenhem as paradas", "Pesquisem o translado"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(screen.queryByText("Como funciona")).not.toBeInTheDocument();
  });

  it("renderiza o boarding-pass ribbon ida e volta (GRU → JFK → MIA → MCO → GRU)", () => {
    render(<HomePage />);
    const ribbon = screen.getByRole("region", { name: /cartão de embarque/i });
    for (const code of ["JFK", "MIA", "MCO"]) {
      expect(within(ribbon).getByText(code)).toBeInTheDocument();
    }
    // round-trip: GRU aparece na ponta de ida e na de volta
    expect(within(ribbon).getAllByText("GRU")).toHaveLength(2);
  });

  it("tem um único botão Entrar (header) apontando para /login", () => {
    render(<HomePage />);
    const entrarLinks = screen.getAllByRole("link", { name: /entrar/i });
    expect(entrarLinks).toHaveLength(1);
    expect(entrarLinks[0]).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("link", { name: /criar viagem/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver exemplo/i })).not.toBeInTheDocument();
  });

  it("não usa as palavras proibidas (whatsapp / caça)", () => {
    const { container } = render(<HomePage />);
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).not.toContain("whatsapp");
    expect(text.toLowerCase()).not.toContain("caça");
  });
});
