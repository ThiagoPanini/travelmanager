import { auth } from "@/auth";
import { internalApiUrl } from "@/lib/bff/url";

/**
 * Plumbing do BFF (ADR-0004): repassa chamadas server-side para a API interna,
 * anexando o token opaco da sessão como `Bearer`. A API nunca é pública — só a
 * rede interna alcança `INTERNAL_API_URL`.
 */

// Reexportado para não quebrar quem importa `internalApiUrl` daqui; a fonte é
// `@/lib/bff/url` (sem dependência de NextAuth — ver módulo).
export { internalApiUrl };

/** Cabeçalhos com `Authorization: Bearer <token>` quando há token de sessão. */
export function withBearer(headers: HeadersInit | undefined, token: string | null): Headers {
  const merged = new Headers(headers);
  if (token) {
    merged.set("Authorization", `Bearer ${token}`);
  }
  return merged;
}

/** O token opaco que a API cunhou, carregado na sessão do Auth.js. */
function sessionToken(session: { accessToken?: string } | null): string | null {
  return session?.accessToken ?? null;
}

/** Fetch server-side para a API interna, já com o Bearer da sessão corrente. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await auth();
  const token = sessionToken(session as { accessToken?: string } | null);
  const url = new URL(path, internalApiUrl());
  const { headers, ...rest } = init;
  return fetch(url, { ...rest, headers: withBearer(headers, token) });
}
