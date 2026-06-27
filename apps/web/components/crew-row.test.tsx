import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrewRow } from "./crew-row";

/** As linhas são `li`; renderiza dentro de uma lista para validar a marcação. */
function inList(node: React.ReactNode) {
  return render(<ul>{node}</ul>);
}

describe("CrewRow", () => {
  it("mostra nome, cidade e o status do papel (sem voto de grupo)", () => {
    inList(<CrewRow initials="MA" name="Maria" meta="São Paulo" status="organiza" tone="accent" />);
    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
    expect(screen.getByText("organiza")).toBeInTheDocument();
  });

  it("o avatar de inicial é decorativo (aria-hidden) — o nome fica visível ao lado", () => {
    inList(<CrewRow initials="MA" name="Maria" status="membro" tone="muted" />);
    expect(screen.getByText("MA")).toHaveAttribute("aria-hidden", "true");
  });

  it("convite cego: avatar tracejado e e-mail como nome, status 'aguardando'", () => {
    inList(
      <CrewRow initials="?" name="ana@exemplo.com" status="aguardando" tone="warning" blind />,
    );
    expect(screen.getByText("ana@exemplo.com")).toBeInTheDocument();
    expect(screen.getByText("aguardando")).toBeInTheDocument();
  });
});
