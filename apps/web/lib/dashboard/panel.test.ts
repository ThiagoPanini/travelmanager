import type { BudgetSummary } from "@traveltogether/types";
import { describe, expect, it } from "vitest";

import { aggregateBudgetByCurrency } from "./panel";

function summary(...subtotals: [string, string][]): BudgetSummary {
  return {
    member_count: 1,
    subtotals: subtotals.map(([currency, per_group]) => ({
      currency,
      per_group,
      per_person: per_group,
    })),
  };
}

describe("aggregateBudgetByCurrency", () => {
  it("sem viagens: lista vazia", () => {
    expect(aggregateBudgetByCurrency([])).toEqual([]);
  });

  it("moedas distintas nunca somam entre si (Invariante 15)", () => {
    const result = aggregateBudgetByCurrency([summary(["BRL", "1000.00"], ["USD", "200.00"])]);
    expect(result).toEqual([
      { currency: "BRL", total: 1000 },
      { currency: "USD", total: 200 },
    ]);
  });

  it("soma a mesma moeda entre Viagens e mantém moedas separadas, ordenadas", () => {
    const result = aggregateBudgetByCurrency([
      summary(["USD", "200.00"]),
      summary(["BRL", "1000.00"], ["USD", "50.00"]),
    ]);
    expect(result).toEqual([
      { currency: "BRL", total: 1000 },
      { currency: "USD", total: 250 },
    ]);
  });
});
