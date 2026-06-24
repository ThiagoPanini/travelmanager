import { afterEach, describe, expect, it, vi } from "vitest";

const { requestOtp } = vi.hoisted(() => ({ requestOtp: vi.fn() }));
vi.mock("@/lib/auth/otp", () => ({ requestOtp }));

import { POST } from "./route";

function post(body: unknown): Request {
  return new Request("http://web/api/otp/request", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

afterEach(() => requestOtp.mockReset());

describe("POST /api/otp/request", () => {
  it("repassa o e-mail e espelha o 202 da API", async () => {
    requestOtp.mockResolvedValue(new Response(null, { status: 202 }));

    const res = await POST(post({ email: "viajante@example.com" }));

    expect(requestOtp).toHaveBeenCalledWith("viajante@example.com");
    expect(res.status).toBe(202);
  });

  it("rejeita corpo sem e-mail com 400, sem chamar a API", async () => {
    const res = await POST(post({}));

    expect(res.status).toBe(400);
    expect(requestOtp).not.toHaveBeenCalled();
  });
});
