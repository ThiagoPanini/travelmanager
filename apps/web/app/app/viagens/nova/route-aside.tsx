"use client";

import { MapPin } from "lucide-react";
import { Fragment } from "react";
import type { StopDraft, TransferDraft } from "@/lib/trips/draft";
import { isTransferDefined } from "@/lib/trips/transfers";
import { type MapEdge, type MapNode, RouteMap } from "./route-map";
import { TransferIcon } from "./transfer-icons";
import styles from "./wizard.module.css";
import type { Origin } from "./wizard-types";
import { originLabel } from "./wizard-types";

type RouteAsideProps = {
  origin: Origin;
  stops: StopDraft[];
  entryTransfer: TransferDraft | null;
  caption: string;
};

/** Nós/arestas plotáveis: só paradas com coords (cidade do dataset). A origem vem do
 *  Perfil como texto (sem coords), então não vai ao mapa — só ao fallback. */
function toMap(
  stops: StopDraft[],
  entryTransfer: TransferDraft | null,
): { nodes: MapNode[]; edges: MapEdge[] } {
  const lastIndex = stops.length - 1;
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];
  stops.forEach((stop, i) => {
    if (stop.lat == null || stop.lng == null) return;
    const idx = nodes.length;
    nodes.push({
      lat: stop.lat,
      lng: stop.lng,
      label: stop.city.trim() || "—",
      kind: i === lastIndex ? "dest" : "stop",
    });
    if (idx > 0) {
      const hop = i === 0 ? entryTransfer : stop.desiredTransfer;
      edges.push({ from: idx - 1, to: idx, defined: isTransferDefined(hop) });
    }
  });
  return { nodes, edges };
}

/**
 * Painel lateral dos passos 1-2 — a "rota de bordo". Mostra o mapa esquemático
 * (ADR-0010) quando há cidades com coords; a coluna vertical origem → paradas → destino
 * é o **fallback honesto** (e o que aparece em SSR/jsdom ou se o mapa falhar).
 */
export function RouteAside({ origin, stops, entryTransfer, caption }: RouteAsideProps) {
  const lastIndex = stops.length - 1;
  const { nodes, edges } = toMap(stops, entryTransfer);
  const dest = stops[lastIndex];
  // Um único nó → foca a cidade; vários → mundo (mostra todos os marcadores).
  const focus =
    nodes.length === 1
      ? { countryCode: dest?.country, coords: { lat: nodes[0].lat, lng: nodes[0].lng }, scale: 5 }
      : undefined;

  const journey = (
    <div className={styles.asideJourney}>
      <div className={styles.asideNode}>
        <span className={`${styles.asideDot} ${styles.asideDotOrigin}`} aria-hidden="true" />
        <span className={styles.asideNodeBody}>
          <span className={styles.asideCity}>{originLabel(origin)}</span>
          <span className={styles.asideTag}>Origem · você</span>
        </span>
      </div>
      {stops.map((stop, i) => {
        const hop = i === 0 ? entryTransfer : stop.desiredTransfer;
        const isDest = i === lastIndex;
        return (
          <Fragment key={stop.id}>
            <span className={styles.asideConn} aria-hidden="true">
              <TransferIcon transfer={hop} size={14} />
            </span>
            <div className={styles.asideNode}>
              <span
                className={`${styles.asideDot} ${isDest ? styles.asideDotDest : ""}`}
                aria-hidden="true"
              />
              <span className={styles.asideNodeBody}>
                <span className={styles.asideCity}>{stop.city.trim() || "—"}</span>
                <span className={styles.asideTag}>
                  {isDest ? "Destino final" : `Parada ${i + 1}`}
                </span>
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );

  return (
    <aside className={styles.aside}>
      <span className={styles.asideCaption}>
        <MapPin size={12} strokeWidth={1.5} aria-hidden="true" /> {caption}
      </span>
      <RouteMap focus={focus} nodes={nodes} edges={edges} fallback={journey} />
    </aside>
  );
}
