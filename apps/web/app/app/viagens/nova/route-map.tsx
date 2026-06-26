"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./wizard.module.css";

/** Nó plotável no mapa — só entra quem tem coords (cidade do dataset). */
export type MapNode = {
  lat: number;
  lng: number;
  label: string;
  kind: "origin" | "stop" | "dest";
};

/** Aresta entre dois nós (índices em `nodes`). `defined` = translado já escolhido. */
export type MapEdge = { from: number; to: number; defined: boolean };

/** Para onde o mapa olha: país (zoom na região) ou um ponto, senão mundo todo. */
export type MapFocus = {
  countryCode?: string | null;
  coords?: { lat: number; lng: number } | null;
  scale?: number;
};

type RouteMapProps = {
  focus?: MapFocus;
  nodes: MapNode[];
  edges?: MapEdge[];
  /** Conteúdo honesto exibido quando não há coords ou o mapa não pôde carregar. */
  fallback: ReactNode;
};

/**
 * Costura **library-agnostic** do mapa esquemático (ADR-0010). A UI fala em
 * `focus`/`nodes`/`edges`; a implementação (hoje jsVectorMap) fica isolada aqui e
 * pode ser trocada sem tocar os passos.
 *
 * Carregamento é **client-only**: jsVectorMap entra por `import()` dinâmico dentro do
 * effect, só quando o container tem layout (`clientWidth > 0`) — em SSR e em jsdom
 * isso é 0, então o `fallback` honesto (a rota vertical) permanece. Coords são
 * client-only e nunca trafegam no payload (ADR-0011).
 */
export function RouteMap({ focus, nodes, edges = [], fallback }: RouteMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Assinatura estável das deps (objetos novos a cada render quebrariam o effect):
  // o mapa só reinicializa quando a rota de fato muda.
  const signature = JSON.stringify({ focus, nodes, edges });

  // biome-ignore lint/correctness/useExhaustiveDependencies: `signature` condensa focus/nodes/edges; hostRef é estável.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || nodes.length === 0) return;
    // Sem layout (SSR/jsdom) → nunca carrega a lib; mantém o fallback.
    if (!host.clientWidth) return;

    let cancelled = false;
    // biome-ignore lint/suspicious/noExplicitAny: instância jsVectorMap (tipos mínimos).
    let map: any;

    (async () => {
      try {
        const { default: JsVectorMap } = await import("jsvectormap");
        // O mapa-mundi é um script que registra via global `jsVectorMap` (setado no
        // import acima) — por isso vem depois, e nesta ordem.
        await import("jsvectormap/dist/maps/world.js");
        await import("jsvectormap/dist/jsvectormap.css");
        if (cancelled) return;

        const cs = getComputedStyle(host);
        const cssVar = (name: string, fallbackValue: string) =>
          cs.getPropertyValue(name).trim() || fallbackValue;
        const accent = cssVar("--accent", "#df6a4d");
        const land = cssVar("--line-muted", "#2a3742");
        const sea = cssVar("--bg-canvas", "#0f171e");

        map = new JsVectorMap({
          selector: host,
          map: "world",
          backgroundColor: "transparent",
          zoomButtons: false,
          zoomOnScroll: false,
          showTooltip: false,
          regionStyle: {
            initial: { fill: land, stroke: sea, strokeWidth: 0.5, fillOpacity: 1 },
          },
          markers: nodes.map((n, i) => ({ name: String(i), coords: [n.lat, n.lng] })),
          markerStyle: {
            initial: { fill: accent, stroke: sea, strokeWidth: 1.5, r: 5 },
          },
          lines: edges.map((e) => ({ from: String(e.from), to: String(e.to) })),
          lineStyle: { stroke: accent, strokeWidth: 1.5, strokeLinecap: "round" },
        });

        if (focus?.coords) {
          map.setFocus({
            coords: [focus.coords.lat, focus.coords.lng],
            scale: focus.scale ?? 4,
            animate: false,
          });
        } else if (focus?.countryCode) {
          map.setFocus({ regions: [focus.countryCode], animate: false });
        }
        setActive(true);
      } catch {
        // Falhou (lib, jsdom, sem WebGL…) → fallback honesto permanece.
        setActive(false);
      }
    })();

    return () => {
      cancelled = true;
      setActive(false);
      try {
        map?.destroy?.();
      } catch {
        // destruição best-effort
      }
    };
  }, [signature]);

  // Sem nada pra plotar → só o fallback (sem moldura de mapa).
  if (nodes.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <div className={styles.mapWrap}>
      <div ref={hostRef} className={styles.mapCanvas} aria-hidden="true" />
      {/* Fallback fica por baixo até o mapa montar — e reaparece se ele falhar. */}
      <div className={active ? styles.mapFallbackHidden : styles.mapFallback}>{fallback}</div>
    </div>
  );
}
