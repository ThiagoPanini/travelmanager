import { completeOnboarding } from "@/lib/bff/server";

/**
 * Proxy do BFF para o onboarding (ADR-0004). A API é interna; o browser fala com
 * esta rota, que repassa server-to-server com o Bearer da sessão (`apiFetch`).
 * Espelha o status da API — inclusive o 422 de validação — sem mascará-lo. A
 * obrigatoriedade dos campos é decidida pela API (autoridade); aqui só barramos
 * corpo malformado (tipos errados).
 */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as {
    display_name?: unknown;
    origin_city?: unknown;
    country?: unknown;
  };
  if (
    typeof body.display_name !== "string" ||
    typeof body.origin_city !== "string" ||
    typeof body.country !== "string"
  ) {
    return new Response(null, { status: 400 });
  }
  const upstream = await completeOnboarding({
    display_name: body.display_name,
    origin_city: body.origin_city,
    country: body.country,
  });
  return new Response(null, { status: upstream.status });
}
