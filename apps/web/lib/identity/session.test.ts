import { describe, expect, it } from "vitest";

import { hasApiAccessToken } from "./session";

describe("hasApiAccessToken", () => {
  it("aceita sessão com token de API não vazio", () => {
    expect(hasApiAccessToken({ apiAccessToken: "token" })).toBe(true);
  });

  it("rejeita sessão antiga do NextAuth sem token de API", () => {
    const legacySession = { email: "alice@example.com", sub: "alice@example.com" };

    expect(hasApiAccessToken(legacySession)).toBe(false);
  });

  it("rejeita sessão nula ou token vazio", () => {
    expect(hasApiAccessToken(null)).toBe(false);
    expect(hasApiAccessToken({ apiAccessToken: "" })).toBe(false);
  });
});
