import { render, screen } from "@testing-library/react";
import { Map as MapIcon } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmBreveCard } from "./em-breve-card";

describe("EmBreveCard", () => {
  it("mostra título, nota e a pílula 'em breve'", () => {
    render(<EmBreveCard icon={MapIcon} title="Roteiro" note="Dia a dia da viagem" />);
    expect(screen.getByText("Roteiro")).toBeInTheDocument();
    expect(screen.getByText("Dia a dia da viagem")).toBeInTheDocument();
    expect(screen.getByText("em breve")).toBeInTheDocument();
  });

  it("é informativo: não é link nem botão (não finge interatividade)", () => {
    render(<EmBreveCard icon={MapIcon} title="Orçamento" note="Rateio do grupo" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
