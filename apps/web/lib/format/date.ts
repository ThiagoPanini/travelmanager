/**
 * Helpers de data do web.
 *
 * A API serializa datas de Parada como datetime (`2026-07-01T00:00:00`),
 * enquanto datas de Viagem chegam como `2026-07-01`. Para formatar com segurança
 * sempre reduzimos a `YYYY-MM-DD` antes de construir um `Date` — caso contrário
 * `new Date("2026-07-01T00:00:00T00:00:00")` vira `Invalid Date`.
 */

/** Reduz qualquer valor de data/datetime para `YYYY-MM-DD` (ou `null`). */
export function dateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

/** Constrói um `Date` local à meia-noite a partir de um valor `YYYY-MM-DD[...]`. */
function localMidnight(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00`);
}

/** `seg, 01 jul` — dia da semana + dia + mês curto. */
export function formatWeekdayDayMonth(value: string | null | undefined): string | null {
  const iso = dateOnly(value);
  if (!iso) return null;
  return localMidnight(iso).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/** `01 jul` — dia + mês curto. */
export function formatDayMonth(value: string | null | undefined): string | undefined {
  const iso = dateOnly(value);
  if (!iso) return undefined;
  return localMidnight(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** `01 jul – 08 jul`, ou um lado só, ou "Datas a definir". */
export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const start = formatDayMonth(startDate);
  const end = formatDayMonth(endDate);
  if (start && end) return `${start} – ${end}`;
  if (start || end) return (start ?? end) as string;
  return "Datas a definir";
}

/** Número de noites entre chegada e saída (ou `null` se indefinido/inválido). */
export function nightsBetween(
  arrival: string | null | undefined,
  departure: string | null | undefined,
): number | null {
  const a = dateOnly(arrival);
  const b = dateOnly(departure);
  if (!a || !b) return null;
  const nights = Math.round((localMidnight(b).getTime() - localMidnight(a).getTime()) / 86_400_000);
  return nights > 0 ? nights : null;
}
