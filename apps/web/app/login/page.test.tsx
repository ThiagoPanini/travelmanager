import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoginPage from "./page";

describe("Login (stub)", () => {
  it("mostra o wordmark e o aviso de 'em breve'", () => {
    render(<LoginPage />);
    expect(screen.getByText("traveltogether")).toBeInTheDocument();
    expect(screen.getAllByText(/em breve/i).length).toBeGreaterThanOrEqual(1);
  });

  it("oferece volta para a landing", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /voltar/i })).toHaveAttribute("href", "/");
  });
});
