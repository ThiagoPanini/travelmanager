import { describe, expect, it } from "vitest";

import { connectedLogins } from "./connected-logins";

// Sem tabela de accounts: a sessão JWT conhece só o provider do login atual.
// E-mail (OTP) é sempre um login válido da conta; Google entra quando foi a via usada.
describe("connectedLogins", () => {
  it("lista e-mail como sempre conectado", () => {
    const logins = connectedLogins(undefined);
    const email = logins.find((l) => l.id === "otp");
    expect(email?.connected).toBe(true);
  });

  it("marca Google conectado quando foi o provider do login", () => {
    const google = connectedLogins("google").find((l) => l.id === "google");
    expect(google?.connected).toBe(true);
  });

  it("marca Google desconectado quando o login foi por outra via", () => {
    const google = connectedLogins("otp").find((l) => l.id === "google");
    expect(google?.connected).toBe(false);
  });
});
