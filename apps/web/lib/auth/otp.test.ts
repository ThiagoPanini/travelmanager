import { afterEach, describe, expect, it, vi } from "vitest";
import { requestOtp, verifyOtp } from "@/lib/auth/otp";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("requestOtp", () => {
  it("posta o e-mail para o endpoint interno de pedido", async () => {
    vi.stubEnv("INTERNAL_API_URL", "http://travelmanager-api:8000");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);

    await requestOtp("viajante@example.com");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe("http://travelmanager-api:8000/auth/otp/request");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ email: "viajante@example.com" });
  });
});

describe("verifyOtp", () => {
  it("mapeia a resposta da API para o usuário do Auth.js", async () => {
    vi.stubEnv("INTERNAL_API_URL", "http://travelmanager-api:8000");
    const body = {
      user: { id: "u-1", email: "viajante@example.com" },
      needs_onboarding: true,
      session_token: "sess-opaco",
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body, { status: 200 })));

    const user = await verifyOtp("viajante@example.com", "246813");

    expect(user).toEqual({
      id: "u-1",
      email: "viajante@example.com",
      accessToken: "sess-opaco",
      needsOnboarding: true,
    });
  });

  it("devolve null quando a API recusa o código", async () => {
    vi.stubEnv("INTERNAL_API_URL", "http://travelmanager-api:8000");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ code: "domain_error" }, { status: 401 })),
    );

    expect(await verifyOtp("viajante@example.com", "000000")).toBeNull();
  });
});
