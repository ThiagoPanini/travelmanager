import styles from "./progress-strip.module.css";

type ProgressStripProps = {
  /** Rótulo do avanço (vira o `aria-label` do progressbar). */
  label: string;
  /** Quantos já contam (numerador). */
  value: number;
  /** Total (denominador). Use só quando ≥ 1 — esconda a faixa quando não há o que medir. */
  max: number;
  /** Contador textual opcional em `warning` (ex.: "2 em discussão"); omitido se vazio. */
  openLabel?: string | null;
};

/**
 * Faixa de avanço da Viagem — rótulo + % mono + trilha 8px (`role="progressbar"`), com um
 * contador `warning` opcional. Mostra estado real do esqueleto (translados propostos),
 * **nunca** dinheiro/pontos/ranking (CONTEXT inv. 5). A largura não anima (decisão do
 * blueprint), então não há custo de movimento.
 */
export function ProgressStrip({ label, value, max, openLabel }: ProgressStripProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={styles.strip}>
      <div className={styles.meter}>
        <div className={styles.head}>
          <span className={styles.label}>{label}</span>
          <span className={styles.percent}>{percent}%</span>
        </div>
        <div
          className={styles.track}
          role="progressbar"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
      </div>
      {openLabel ? (
        <p className={styles.open}>
          <span className={styles.openDot} aria-hidden="true" />
          {openLabel}
        </p>
      ) : null}
    </div>
  );
}
