import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "./otp-input";

/** Wrapper controlado: espelha o `value` para checar a montagem dígito-a-dígito. */
function Harness() {
  const [value, setValue] = useState("");
  return (
    <>
      <OtpInput value={value} onChange={setValue} />
      <output data-testid="valor">{value}</output>
    </>
  );
}

describe("OtpInput (código de embarque)", () => {
  it("expõe um grupo rotulado 'Código de embarque' com 6 células", () => {
    render(<OtpInput value="" onChange={vi.fn()} />);
    expect(screen.getByRole("group", { name: /código de embarque/i })).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
  });

  it("cada célula pede teclado numérico e o autofill de OTP", () => {
    render(<OtpInput value="" onChange={vi.fn()} />);
    for (const cell of screen.getAllByRole("textbox")) {
      expect(cell).toHaveAttribute("inputmode", "numeric");
      expect(cell).toHaveAttribute("autocomplete", "one-time-code");
    }
  });

  it("monta o código conforme o usuário digita as 6 células", () => {
    render(<Harness />);
    const cells = screen.getAllByRole("textbox");
    "246813".split("").forEach((digit, i) => {
      fireEvent.change(cells[i], { target: { value: digit } });
    });
    expect(screen.getByTestId("valor")).toHaveTextContent("246813");
  });

  it("ignora caracteres não-numéricos", () => {
    const onChange = vi.fn();
    render(<OtpInput value="" onChange={onChange} />);
    const cells = screen.getAllByRole("textbox");
    fireEvent.change(cells[0], { target: { value: "a" } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
