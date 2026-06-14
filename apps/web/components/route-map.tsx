"use client";

import type { MapPoint, RouteMapData } from "@/lib/trips/map";

const W = 600;
const H = 340;
const PAD = 48;

function project(
  point: MapPoint,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  const scale = Math.min((W - PAD * 2) / lngRange, (H - PAD * 2) / latRange);
  const offsetX = (W - lngRange * scale) / 2;
  const offsetY = (H - latRange * scale) / 2;
  const x = offsetX + (point.lng - minLng) * scale;
  const y = offsetY + (maxLat - point.lat) * scale;
  return { x, y };
}

function arcPath(ax: number, ay: number, bx: number, by: number): string {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  const pull = Math.min(len * 0.28, 60);
  const cx = mx - (dy / len) * pull;
  const cy = my + (dx / len) * pull;
  return `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
}

export default function RouteMap({ data }: { data: RouteMapData }) {
  if (!data.hasAllCoords || data.points.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 180,
          color: "var(--muted)",
          fontSize: 13,
          fontFamily: "var(--font-mono)",
          border: "1px dashed var(--border)",
          borderRadius: 8,
        }}
      >
        coordenadas não disponíveis para todas as paradas
      </div>
    );
  }

  const lats = data.points.map((p) => p.lat);
  const lngs = data.points.map((p) => p.lng);
  const bounds = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };

  const projected = data.points.map((p) => ({ ...p, ...project(p, bounds) }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", maxWidth: W, margin: "0 auto" }}
      aria-label="Mapa geográfico da rota"
      role="img"
    >
      {/* arcs */}
      {data.arcs.map((arc, i) => {
        const from = projected.find((p) => p.id === arc.from.id);
        const to = projected.find((p) => p.id === arc.to.id);
        if (!from || !to) return null;
        return (
          <path
            // biome-ignore lint/suspicious/noArrayIndexKey: arc positions are stable
            key={i}
            d={arcPath(from.x, from.y, to.x, to.y)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            opacity={0.75}
          />
        );
      })}

      {/* nodes */}
      {projected.map((p) => (
        <g key={p.id}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.isOrigin ? 6 : 5}
            fill={p.isOrigin ? "var(--accent)" : "var(--floresta, #2d5016)"}
            stroke="var(--surface)"
            strokeWidth={2}
          />
          {p.code ? (
            <text
              x={p.x}
              y={p.y - 11}
              textAnchor="middle"
              fontSize={10}
              fontFamily="var(--font-mono)"
              fill="var(--ink)"
              fontWeight={600}
            >
              {p.code}
            </text>
          ) : (
            <text
              x={p.x}
              y={p.y - 11}
              textAnchor="middle"
              fontSize={9}
              fontFamily="var(--font-mono)"
              fill="var(--ink-soft)"
            >
              {p.label.slice(0, 8)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
