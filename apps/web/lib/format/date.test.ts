import { describe, expect, it } from "vitest";

import {
  dateOnly,
  formatDateRange,
  formatDayMonth,
  formatWeekdayDayMonth,
  nightsBetween,
} from "./date";

// A API serializa datas de Parada como datetime; estes testes travam a regressão
// do "Invalid Date" que aparecia ao concatenar T00:00:00 num valor já com hora.
describe("date helpers com datetime da API", () => {
  it("dateOnly reduz datetime e ISO ao mesmo YYYY-MM-DD", () => {
    expect(dateOnly("2026-07-01T00:00:00")).toBe("2026-07-01");
    expect(dateOnly("2026-07-01")).toBe("2026-07-01");
    expect(dateOnly(null)).toBeNull();
    expect(dateOnly("")).toBeNull();
  });

  it("formata datetime sem produzir Invalid Date", () => {
    expect(formatDayMonth("2026-07-01T00:00:00")).not.toContain("Invalid");
    expect(formatWeekdayDayMonth("2026-07-01T00:00:00")).not.toContain("Invalid");
    expect(formatDayMonth("2026-07-01T00:00:00")).toBe(formatDayMonth("2026-07-01"));
  });

  it("nightsBetween calcula a partir de datetimes (não vira NaN)", () => {
    expect(nightsBetween("2026-07-01T00:00:00", "2026-07-08T00:00:00")).toBe(7);
    expect(nightsBetween("2026-07-01", "2026-07-01")).toBeNull();
    expect(nightsBetween(null, "2026-07-08")).toBeNull();
  });

  it("formatDateRange cobre os dois lados e o vazio", () => {
    expect(formatDateRange("2026-07-01T00:00:00", "2026-07-08T00:00:00")).toContain("–");
    expect(formatDateRange(null, null)).toBe("Datas a definir");
  });
});
