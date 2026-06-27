import type { LucideIcon } from "lucide-react";
import styles from "./em-breve-card.module.css";

/**
 * Card "em breve" de uma casca futura da Viagem (Roteiro/Orçamento/Ingressos — cascas V1).
 * Borda tracejada, ícone mono decorativo (`aria-hidden`) e pílula "em breve" textual.
 * É informativo: não é link/botão e não recebe foco — o texto comunica a indisponibilidade.
 */
export function EmBreveCard({
  icon: Icon,
  title,
  note,
}: {
  icon: LucideIcon;
  title: string;
  note: string;
}) {
  return (
    <div className={styles.card}>
      <Icon size={18} strokeWidth={1.5} className={styles.icon} aria-hidden="true" />
      <div className={styles.body}>
        <span className={styles.title}>{title}</span>
        <span className={styles.note}>{note}</span>
      </div>
      <span className={styles.tag}>em breve</span>
    </div>
  );
}
