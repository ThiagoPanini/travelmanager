import { afterEach, describe, expect, it, vi } from "vitest";

const { completeOnboarding } = vi.hoisted(() => ({ completeOnboarding: vi.fn() }));
vi.mock("@/lib/bff/server", () => ({ completeOnboarding }));

import { POST } from "./route";

function post(body: unknown): Request {
  return new Request("http://web/api/profile", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

afterEach(() => completeOnboarding.mockReset());

describe("POST /api/profile", () => {
  it("repassa o perfil à API e espelha o status de sucesso", async () => {
    completeOnboarding.mockResolvedValue(new Response(null, { status: 200 }));

    const res = await POST(
      post({ display_name: "Maria", origin_city: "São Paulo", country: "BR" }),
    );

    expect(completeOnboarding).toHaveBeenCalledWith({
      display_name: "Maria",
      origin_city: "São Paulo",
      country: "BR",
    });
    expect(res.status).toBe(200);
  });

  it("espelha o 422 da API (validação) sem mascarar", async () => {
    completeOnboarding.mockResolvedValue(new Response(null, { status: 422 }));

    const res = await POST(post({ display_name: "", origin_city: "São Paulo", country: "BR" }));

    expect(res.status).toBe(422);
  });

  it("rejeita corpo malformado com 400, sem chamar a API", async () => {
    const res = await POST(post({ display_name: 42 }));

    expect(res.status).toBe(400);
    expect(completeOnboarding).not.toHaveBeenCalled();
  });
});
