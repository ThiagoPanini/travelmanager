import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DemoLauncher } from "./demo-launcher";

// O DemoLauncher é o gatilho cliente do "Ver exemplo": um botão que abre o
// DemoOverlay. Sem jsdom, testamos o estado inicial (fechado) — o abrir/fechar
// é interação de cliente. O botão carrega o rótulo e o ícone do protótipo.

describe("DemoLauncher", () => {
  it("renderiza o botão com o rótulo e a classe recebidos", () => {
    const html = renderToStaticMarkup(<DemoLauncher className="btn ghost" label="Ver exemplo" />);
    expect(html).toContain("Ver exemplo");
    expect(html).toContain('type="button"');
    expect(html).toContain('class="btn ghost"');
  });

  it("nasce fechado — o overlay só aparece após o clique", () => {
    const html = renderToStaticMarkup(<DemoLauncher label="Ver exemplo" />);
    expect(html).not.toContain("somente leitura");
    expect(html).not.toContain('role="dialog"');
  });
});
