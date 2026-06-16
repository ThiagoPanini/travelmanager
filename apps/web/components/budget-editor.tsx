"use client";

import type { RateioBasis } from "@traveltogether/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createExtraAction,
  createLodgingAction,
  deleteExtraAction,
  deleteLodgingAction,
} from "@/app/actions/budget";
import { Icon } from "@/components/atlas";
import type { ExtraLine, LodgingLine } from "@/lib/budget/sections";
import { rateioLabel } from "@/lib/budget/sections";

interface Props {
  tripId: string;
  canManage: boolean;
  stops: { id: string; city: string }[];
  lodgings: LodgingLine[];
  extras: ExtraLine[];
}

function fmtMoney(value: string, currency: string): string {
  const numeric = Number.parseFloat(value.replace(",", "."));
  if (!Number.isFinite(numeric)) return `${currency} ${value}`;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(numeric);
  } catch {
    return `${currency} ${numeric.toFixed(2)}`;
  }
}

const BASIS_OPTIONS: RateioBasis[] = ["per_person", "split"];

export default function BudgetEditor({ tripId, canManage, stops, lodgings, extras }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Hospedagem form
  const [lStop, setLStop] = useState(stops[0]?.id ?? "");
  const [lDesc, setLDesc] = useState("");
  const [lValue, setLValue] = useState("");
  const [lCurrency, setLCurrency] = useState("BRL");
  const [lBasis, setLBasis] = useState<RateioBasis>("split");

  // Extra form
  const [eDesc, setEDesc] = useState("");
  const [eValue, setEValue] = useState("");
  const [eCurrency, setECurrency] = useState("BRL");
  const [eBasis, setEBasis] = useState<RateioBasis>("split");

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function addLodging(e: React.FormEvent) {
    e.preventDefault();
    if (!lStop || !lValue.trim()) return;
    const created = await createLodgingAction(tripId, {
      stop_id: lStop,
      description: lDesc,
      nightly_value: lValue.replace(",", "."),
      currency: lCurrency || "BRL",
      basis: lBasis,
    });
    if (created) {
      setLDesc("");
      setLValue("");
      refresh();
    }
  }

  async function removeLodging(id: string) {
    if (await deleteLodgingAction(tripId, id)) refresh();
  }

  async function addExtra(e: React.FormEvent) {
    e.preventDefault();
    if (!eValue.trim()) return;
    const created = await createExtraAction(tripId, {
      description: eDesc,
      value: eValue.replace(",", "."),
      currency: eCurrency || "BRL",
      basis: eBasis,
    });
    if (created) {
      setEDesc("");
      setEValue("");
      refresh();
    }
  }

  async function removeExtra(id: string) {
    if (await deleteExtraAction(tripId, id)) refresh();
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {/* Hospedagem */}
      <section>
        <div className="section-head" style={{ marginBottom: 12 }}>
          <span className="kicker">hospedagem</span>
          <h2 style={{ fontSize: 18 }}>Estadias por parada</h2>
        </div>
        <div className="card flat" style={{ padding: "16px 20px" }}>
          {lodgings.length === 0 ? (
            <div className="mono" style={{ fontSize: 12.5, color: "var(--muted)" }}>
              Nenhuma hospedagem lançada.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {lodgings.map((l) => (
                <div
                  key={l.id}
                  style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}
                >
                  <span className="chip outline" style={{ fontSize: 11 }}>
                    <Icon name="pin" size={10} /> {l.stopLabel}
                  </span>
                  {l.description && (
                    <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                      {l.description}
                    </span>
                  )}
                  <span className="mono-num" style={{ fontSize: 15, fontWeight: 700 }}>
                    {fmtMoney(l.nightlyValue, l.currency)}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                    /noite × {l.nights} {l.nights === 1 ? "noite" : "noites"} ·{" "}
                    {rateioLabel(l.basis)}
                  </span>
                  {canManage && (
                    <button
                      className="icon-btn"
                      disabled={pending}
                      onClick={() => removeLodging(l.id)}
                      style={{ marginLeft: "auto" }}
                      title="Remover hospedagem"
                      type="button"
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canManage && stops.length > 0 && (
            <form
              onSubmit={addLodging}
              style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}
            >
              <select onChange={(e) => setLStop(e.target.value)} value={lStop}>
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.city}
                  </option>
                ))}
              </select>
              <input
                onChange={(e) => setLDesc(e.target.value)}
                placeholder="Descrição"
                style={{ flex: "1 1 140px" }}
                value={lDesc}
              />
              <input
                onChange={(e) => setLValue(e.target.value)}
                placeholder="Valor/noite"
                style={{ width: 110 }}
                value={lValue}
              />
              <input
                onChange={(e) => setLCurrency(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="BRL"
                style={{ width: 66 }}
                value={lCurrency}
              />
              <select onChange={(e) => setLBasis(e.target.value as RateioBasis)} value={lBasis}>
                {BASIS_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {rateioLabel(b)}
                  </option>
                ))}
              </select>
              <button className="btn small accent" disabled={pending} type="submit">
                <Icon name="plus" size={13} /> Adicionar
              </button>
            </form>
          )}
          {canManage && stops.length === 0 && (
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}>
              Adicione paradas para ancorar hospedagens.
            </div>
          )}
        </div>
      </section>

      {/* Extras */}
      <section>
        <div className="section-head" style={{ marginBottom: 12 }}>
          <span className="kicker">extras</span>
          <h2 style={{ fontSize: 18 }}>Outros custos</h2>
        </div>
        <div className="card flat" style={{ padding: "16px 20px" }}>
          {extras.length === 0 ? (
            <div className="mono" style={{ fontSize: 12.5, color: "var(--muted)" }}>
              Nenhum extra lançado.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {extras.map((x) => (
                <div
                  key={x.id}
                  style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}
                >
                  <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                    {x.description || "Extra"}
                  </span>
                  <span className="mono-num" style={{ fontSize: 15, fontWeight: 700 }}>
                    {fmtMoney(x.value, x.currency)}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                    {rateioLabel(x.basis)}
                  </span>
                  {canManage && (
                    <button
                      className="icon-btn"
                      disabled={pending}
                      onClick={() => removeExtra(x.id)}
                      style={{ marginLeft: "auto" }}
                      title="Remover extra"
                      type="button"
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canManage && (
            <form
              onSubmit={addExtra}
              style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}
            >
              <input
                onChange={(e) => setEDesc(e.target.value)}
                placeholder="Descrição"
                style={{ flex: "1 1 160px" }}
                value={eDesc}
              />
              <input
                onChange={(e) => setEValue(e.target.value)}
                placeholder="Valor"
                style={{ width: 110 }}
                value={eValue}
              />
              <input
                onChange={(e) => setECurrency(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="BRL"
                style={{ width: 66 }}
                value={eCurrency}
              />
              <select onChange={(e) => setEBasis(e.target.value as RateioBasis)} value={eBasis}>
                {BASIS_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {rateioLabel(b)}
                  </option>
                ))}
              </select>
              <button className="btn small accent" disabled={pending} type="submit">
                <Icon name="plus" size={13} /> Adicionar
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
