import type { LegPublic, StopPublic, TripPublic } from "@traveltogether/types";

export interface MapPoint {
  id: string;
  label: string;
  code: string | null;
  lat: number;
  lng: number;
  isOrigin?: boolean;
}

export interface MapArc {
  from: MapPoint;
  to: MapPoint;
}

export interface RouteMapData {
  points: MapPoint[];
  arcs: MapArc[];
  hasAllCoords: boolean;
}

export function buildMapData(
  trip: TripPublic,
  stops: StopPublic[],
  _legs: LegPublic[],
): RouteMapData {
  const originHasCoords = trip.latitude !== null && trip.longitude !== null;
  const sortedStops = [...stops].sort((a, b) => a.order - b.order);
  const stopsHaveCoords = sortedStops.every((s) => s.latitude !== null && s.longitude !== null);

  const hasAllCoords = originHasCoords && (sortedStops.length === 0 || stopsHaveCoords);

  if (!originHasCoords) {
    return { points: [], arcs: [], hasAllCoords: false };
  }

  const originPoint: MapPoint = {
    id: `origin-${trip.id}`,
    label: trip.origin,
    code: trip.airport_code,
    lat: trip.latitude as number,
    lng: trip.longitude as number,
    isOrigin: true,
  };

  if (sortedStops.length === 0) {
    return { points: [originPoint], arcs: [], hasAllCoords };
  }

  const stopPoints: MapPoint[] = sortedStops
    .filter((s) => s.latitude !== null && s.longitude !== null)
    .map((s) => ({
      id: s.id,
      label: s.city,
      code: s.airport_code,
      lat: s.latitude as number,
      lng: s.longitude as number,
    }));

  const returnPoint: MapPoint = { ...originPoint, id: `return-${trip.id}` };
  const points = [originPoint, ...stopPoints, returnPoint];

  const arcs: MapArc[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    arcs.push({ from: points[i], to: points[i + 1] });
  }

  return { points, arcs, hasAllCoords };
}
