import type { ReactNode } from "react";
import styles from "./status-pill.module.css";

/** Tom semântico da pílula (cada um carrega cor **e** borda própria — nunca só cor). */
export type PillTone = "accent" | "warning" | "success" | "muted";

/**
 * Pílula de status — mono caixa-alta com borda semântica. O estado nunca depende só de
 * cor: o texto (children) já diz o estado, e tom = cor + borda (a11y do repo). Não
 * representa decisão de grupo (CONTEXT inv. 4); é só rótulo de situação.
 */
export function StatusPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return <span className={`${styles.pill} ${styles[tone]}`}>{children}</span>;
}
