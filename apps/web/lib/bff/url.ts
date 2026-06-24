/**
 * Endereço da API interna (ADR-0004). Isolado de `@/auth` de propósito: tanto o BFF
 * autenticado quanto o ciclo OTP (pré-sessão) leem a URL, e nenhum deles deve
 * arrastar o NextAuth só para montar um endereço.
 */

/** Endereço da API interna; falha alto se não configurado (cabeado na #196). */
export function internalApiUrl(): string {
  const base = process.env.INTERNAL_API_URL;
  if (!base) {
    throw new Error("INTERNAL_API_URL não configurada");
  }
  return base;
}
