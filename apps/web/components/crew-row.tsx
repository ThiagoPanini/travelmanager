import styles from "./crew-row.module.css";

/** Tom do status do tripulante (cor + texto; nunca só cor). */
export type CrewTone = "accent" | "muted" | "warning";

type CrewRowProps = {
  /** Iniciais no avatar (ou "?" no convite cego). Decorativo — o nome fica visível ao lado. */
  initials: string;
  /** Nome de exibição do membro aceito, ou o e-mail do convite pendente. */
  name: string;
  /** Linha secundária opcional (cidade do membro). */
  meta?: string | null;
  /** Status textual: "organiza" / "membro" / "aguardando". */
  status: string;
  tone: CrewTone;
  /** Convite cego: avatar tracejado sem preenchimento (ainda não é gente com perfil). */
  blind?: boolean;
};

/**
 * Linha de tripulação — avatar de inicial (decorativo, `aria-hidden`), nome + cidade e o
 * status mono à direita. Usa papéis/estados reais (`organiza`/`membro`/`aguardando`), nunca
 * `votou`/`falta votar` (não há voto de grupo — CONTEXT inv. 4). É um `li`: use dentro de `ul`.
 */
export function CrewRow({ initials, name, meta, status, tone, blind = false }: CrewRowProps) {
  return (
    <li className={styles.row}>
      <span className={`${styles.avatar} ${blind ? styles.blind : ""}`} aria-hidden="true">
        {initials}
      </span>
      <span className={styles.info}>
        <span className={styles.name}>{name}</span>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </span>
      <span className={`${styles.status} ${styles[tone]}`}>{status}</span>
    </li>
  );
}
