/**
 * Lista curada de países (ISO-3166 alfa-2 + nome pt-BR) para o select de onboarding.
 *
 * Subconjunto MVP — o suficiente para a origem da maioria; a lista completa (e o
 * mapa cidade→aeroporto) é Fase 5 (ADR-0006). Brasil encabeça por ser o caso comum.
 */

export type Country = { code: string; name: string };

export const COUNTRIES: Country[] = [
  { code: "BR", name: "Brasil" },
  { code: "PT", name: "Portugal" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "UY", name: "Uruguai" },
  { code: "PY", name: "Paraguai" },
  { code: "CO", name: "Colômbia" },
  { code: "PE", name: "Peru" },
  { code: "MX", name: "México" },
  { code: "US", name: "Estados Unidos" },
  { code: "CA", name: "Canadá" },
  { code: "GB", name: "Reino Unido" },
  { code: "IE", name: "Irlanda" },
  { code: "FR", name: "França" },
  { code: "ES", name: "Espanha" },
  { code: "IT", name: "Itália" },
  { code: "DE", name: "Alemanha" },
  { code: "NL", name: "Países Baixos" },
  { code: "CH", name: "Suíça" },
  { code: "JP", name: "Japão" },
  { code: "AU", name: "Austrália" },
  { code: "AO", name: "Angola" },
  { code: "MZ", name: "Moçambique" },
];
