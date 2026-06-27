import type { ReactNode } from "react";
import styles from "./tab-chip.module.css";

type TabChipProps = {
  children: ReactNode;
  /** "active" = vista atual (anunciada com `aria-current`); "soon" = casca em breve. */
  state: "active" | "soon";
};

/**
 * Chip de seção dentro da Viagem. A vista atual é `active` (`aria-current="page"`, accent
 * sólido); as cascas ainda não construídas são `soon` — visualmente tracejadas/muted, **sem
 * foco** (item indisponível não recebe foco) e com um sufixo "em breve" só para o leitor de
 * tela (estado não comunicado só por cor). Não é link: nenhuma das duas navega.
 */
export function TabChip({ children, state }: TabChipProps) {
  if (state === "active") {
    return (
      <span className={`${styles.chip} ${styles.active}`} aria-current="page">
        {children}
      </span>
    );
  }
  return (
    <span className={`${styles.chip} ${styles.soon}`} aria-disabled="true">
      {children}
      <span className="sr-only"> (em breve)</span>
    </span>
  );
}
