import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("public auth copy", () => {
  it("keeps private-access copy direct and free of boarding-pass kitsch", async () => {
    const source = await readFile(new URL("../app/login/login-form.tsx", import.meta.url), "utf8");

    // direção Atlas: sem a metáfora antiga de cartão de embarque
    expect(source).not.toContain("Boarding pass");
    expect(source).not.toContain("Check-in da galera");
    expect(source).not.toContain("∞");

    // acesso privado por allowlist continua explícito
    expect(source).toContain("Identifique-se");
    expect(source).toContain("Acesso privado");
    expect(source).toContain("allowlist");
  });
});
