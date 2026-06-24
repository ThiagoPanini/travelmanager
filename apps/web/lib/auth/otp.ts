import { internalApiUrl } from "@/lib/bff/url";

/**
 * Cliente server-side do ciclo OTP contra a API interna (ADR-0004). A API nunca é
 * pública: estas chamadas saem do servidor do Next, sem `Bearer` (ainda não há
 * sessão). `verifyOtp` cunha a sessão e devolve o token opaco que o Auth.js guarda
 * no cookie httpOnly — nunca exposto ao browser.
 */

/** Usuário verificado, no formato que o `authorize` do Auth.js retorna. */
export type VerifiedUser = {
  id: string;
  email: string;
  accessToken: string;
  needsOnboarding: boolean;
};

function jsonPost(path: string, payload: unknown): Promise<Response> {
  const url = new URL(path, internalApiUrl());
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Passo 1: pede um código para o e-mail (resposta 202, anti-enumeração). */
export async function requestOtp(email: string): Promise<Response> {
  return jsonPost("/auth/otp/request", { email });
}

/** Passo 2: valida o código; devolve o usuário cunhado ou `null` se recusado. */
export async function verifyOtp(email: string, code: string): Promise<VerifiedUser | null> {
  const res = await jsonPost("/auth/otp/verify", { email, code });
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as {
    user: { id: string; email: string };
    needs_onboarding: boolean;
    session_token: string;
  };
  return {
    id: data.user.id,
    email: data.user.email,
    accessToken: data.session_token,
    needsOnboarding: data.needs_onboarding,
  };
}
