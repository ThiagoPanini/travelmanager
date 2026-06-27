import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressStrip } from "./progress-strip";

describe("ProgressStrip", () => {
  it("expõe um progressbar com valor/mín/máx e o rótulo como nome acessível", () => {
    render(<ProgressStrip label="3 de 4 trajetos com translado" value={3} max={4} />);
    const bar = screen.getByRole("progressbar", { name: /3 de 4 trajetos/i });
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "4");
  });

  it("mostra a porcentagem arredondada em texto", () => {
    render(<ProgressStrip label="x" value={1} max={3} />);
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("mostra o contador de pendências quando há openLabel, e o esconde quando não", () => {
    const { rerender } = render(
      <ProgressStrip label="x" value={1} max={3} openLabel="2 em discussão" />,
    );
    expect(screen.getByText("2 em discussão")).toBeInTheDocument();
    rerender(<ProgressStrip label="x" value={3} max={3} openLabel={null} />);
    expect(screen.queryByText(/em discussão/i)).not.toBeInTheDocument();
  });
});
