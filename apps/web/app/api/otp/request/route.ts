import { requestOtp } from "@/lib/auth/otp";

/**
 * Proxy do BFF para o passo 1 do OTP (ADR-0004). A API é interna; o browser fala
 * com esta rota, que repassa server-to-server. Espelha o status da API (202,
 * anti-enumeração) sem nunca devolver o código.
 */
export async function POST(request: Request): Promise<Response> {
  const { email } = (await request.json()) as { email?: unknown };
  if (typeof email !== "string" || !email) {
    return new Response(null, { status: 400 });
  }
  const upstream = await requestOtp(email);
  return new Response(null, { status: upstream.status });
}
