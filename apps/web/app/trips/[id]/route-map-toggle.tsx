"use client";

import { useState } from "react";
import { type RouteEdge, RouteLine, type RoutePoint } from "@/components/atlas";
import RouteMap from "@/components/route-map";
import type { RouteMapData } from "@/lib/trips/map";

interface Props {
  points: RoutePoint[];
  edges: RouteEdge[];
  mapData: RouteMapData;
}

export default function RouteMapToggle({ points, edges, mapData }: Props) {
  const [showMap, setShowMap] = useState(false);
  const canShowMap = mapData.hasAllCoords && mapData.points.length > 1;

  return (
    <>
      {canShowMap && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            type="button"
            className="btn tiny ghost"
            onClick={() => setShowMap((v) => !v)}
            style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
          >
            {showMap ? "◁ esquemático" : "▷ mapa geográfico"}
          </button>
        </div>
      )}
      {showMap ? <RouteMap data={mapData} /> : <RouteLine points={points} edges={edges} />}
    </>
  );
}
