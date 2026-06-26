"use client";

import { useState } from "react";
import { isTransferDefined } from "@/lib/trips/transfers";
import { TransferModal } from "./transfer-modal";
import { TransferTrail, type TransferTrailLeg } from "./transfer-trail";
import styles from "./wizard.module.css";
import type { StepProps } from "./wizard-types";
import { originLabel } from "./wizard-types";

/**
 * Passo 3 — Translados (intenção; ADR-0009). Trilha horizontal com um **anel** clicável
 * entre cada par de cidades: tracejado quando indefinido, terracota quando há proposta.
 * O 1º salto é a ida pessoal do criador (entry_transfer, "sua ida · por pessoa", conta
 * no total). A 1ª parada não tem salto compartilhado — quem chega nela é a ponta pessoal.
 */
export function StepTranslados({ draft, dispatch, origin }: StepProps) {
  const [open, setOpen] = useState<TransferTrailLeg | null>(null);
  const { stops } = draft;
  const total = stops.length; // 1 ida pessoal + (stops.length - 1) saltos compartilhados
  const defined =
    (isTransferDefined(draft.entryTransfer) ? 1 : 0) +
    stops.slice(1).filter((s) => isTransferDefined(s.desiredTransfer)).length;

  return (
    <div className={styles.transferStep}>
      <header className={styles.sectionHead}>
        <p className={styles.eyebrow}>Passo 03 · Translados</p>
        <h1 className={styles.title}>Como vencer cada salto?</h1>
        <p className={styles.lede}>
          Proponha como vencer cada trajeto. Sua ida de casa até a primeira Parada é pessoal; os
          demais saltos são compartilhados pelo grupo.
        </p>
      </header>

      <div className={styles.legProgress}>
        <span className={styles.legProgressTrack} aria-hidden="true">
          <span
            className={styles.legProgressFill}
            style={{ width: `${total > 0 ? (defined / total) * 100 : 0}%` }}
          />
        </span>
        <span className={styles.legProgressText}>
          {defined} de {total} trajetos definidos
        </span>
      </div>

      <TransferTrail
        origin={origin}
        stops={stops}
        entryTransfer={draft.entryTransfer}
        onOpen={setOpen}
      />

      <p className={styles.transferNotice}>
        Translados são propostas, não compras. Cada pessoa pesquisa e decide a sua depois.
      </p>

      {open ? (
        <TransferModal
          legLabel={
            open.type === "entry"
              ? `Trajeto 1 de ${total}`
              : `Trajeto ${open.index + 1} de ${total}`
          }
          endpoints={
            open.type === "entry"
              ? `${originLabel(origin)} → ${stops[0].city.trim() || "1ª parada"}`
              : `${stops[open.index - 1].city.trim() || "Parada"} → ${stops[open.index].city.trim() || "Parada"}`
          }
          current={open.type === "entry" ? draft.entryTransfer : stops[open.index].desiredTransfer}
          onSelect={(transfer) => {
            if (open.type === "entry") {
              dispatch({ type: "setEntryTransfer", transfer });
            } else {
              dispatch({ type: "setStopTransfer", id: open.id, transfer });
            }
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
