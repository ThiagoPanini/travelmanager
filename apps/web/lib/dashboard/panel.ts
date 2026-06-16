import type { BudgetSummary } from "@traveltogether/types";

import { moneyValue } from "../fares/format";

export interface BudgetByCurrency {
  currency: string;
  total: number;
}

// Soma os subtotais por_group das Viagens do usuário, ESTRITAMENTE por moeda.
// Invariante 15 (ADR-0016): nunca há conversão de câmbio — moedas distintas
// permanecem em linhas separadas, jamais somadas entre si.
export function aggregateBudgetByCurrency(summaries: BudgetSummary[]): BudgetByCurrency[] {
  const totals = new Map<string, number>();
  for (const summary of summaries) {
    for (const subtotal of summary.subtotals) {
      const amount = moneyValue(subtotal.per_group);
      if (!Number.isFinite(amount)) continue;
      totals.set(subtotal.currency, (totals.get(subtotal.currency) ?? 0) + amount);
    }
  }
  return [...totals.entries()]
    .map(([currency, total]) => ({ currency, total }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}
