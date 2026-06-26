"use client";

import { Fragment } from "react";
import { COUNTRIES } from "@/lib/countries";
import type { StopDraft, TransferDraft } from "@/lib/trips/draft";
import { isTransferDefined, transferLabel } from "@/lib/trips/transfers";
import { TransferIcon } from "./transfer-icons";
import styles from "./wizard.module.css";
import type { Origin } from "./wizard-types";
import { originLabel } from "./wizard-types";

export type TransferTrailLeg = { type: "entry" } | { type: "stop"; id: string; index: number };

type TransferTrailProps = {
  origin: Origin;
  stops: StopDraft[];
  entryTransfer: TransferDraft | null;
  onOpen: (leg: TransferTrailLeg) => void;
};

function countryName(code: string | null): string {
  return COUNTRIES.find((country) => country.code === code)?.name ?? "País a definir";
}

function TrailNode({
  kicker,
  city,
  country,
  variant,
}: {
  kicker: string;
  city: string;
  country: string | null;
  variant: "origin" | "stop" | "dest";
}) {
  return (
    <div className={styles.transferNode}>
      <span className={styles.transferNodeKicker}>{kicker}</span>
      <span className={styles.transferNodeCore}>
        <span
          className={`${styles.transferNodeDot} ${styles[`transferNodeDot_${variant}`]}`}
          aria-hidden="true"
        />
        <span className={styles.transferNodeCity}>{city.trim() || "—"}</span>
      </span>
      <span className={styles.transferNodeCountry}>{countryName(country)}</span>
    </div>
  );
}

/** Trilha horizontal editável dos translados desejados, com overflow para rotas longas. */
export function TransferTrail({ origin, stops, entryTransfer, onOpen }: TransferTrailProps) {
  return (
    <section className={styles.transferTrailViewport} aria-label="Trilha de translados">
      <div className={styles.transferTrail}>
        <TrailNode
          kicker="Origem"
          city={originLabel(origin)}
          country={origin.country}
          variant="origin"
        />

        {stops.map((stop, index) => {
          const isDestination = index === stops.length - 1;
          const isEntry = index === 0;
          const transfer = isEntry ? entryTransfer : stop.desiredTransfer;
          const from = isEntry ? originLabel(origin) : stops[index - 1].city.trim() || "Parada";
          const to = stop.city.trim() || (isDestination ? "Destino" : `Parada ${index + 1}`);
          const defined = isTransferDefined(transfer);
          return (
            <Fragment key={stop.id}>
              <div className={styles.transferLink}>
                <div className={styles.transferLinkTop}>
                  <span
                    className={`${styles.transferLine} ${defined ? styles.transferLineDefined : ""}`}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className={`${styles.legRing} ${defined ? styles.legRingDefined : ""}`}
                    aria-label={`${transfer ? "Alterar" : "Definir"} translado de ${from} para ${to}`}
                    onClick={() =>
                      onOpen(isEntry ? { type: "entry" } : { type: "stop", id: stop.id, index })
                    }
                  >
                    <TransferIcon transfer={transfer} size={19} />
                  </button>
                  <span
                    className={`${styles.transferLine} ${defined ? styles.transferLineDefined : ""}`}
                    aria-hidden="true"
                  />
                </div>
                <span className={styles.transferLinkLabel}>
                  {transfer ? transferLabel(transfer) : "Definir translado"}
                </span>
              </div>
              <TrailNode
                kicker={isDestination ? "Destino" : `Parada ${index + 1}`}
                city={to}
                country={stop.country}
                variant={isDestination ? "dest" : "stop"}
              />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
