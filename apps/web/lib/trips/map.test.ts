import type { LegPublic, StopPublic, TripPublic } from "@traveltogether/types";
import { describe, expect, it } from "vitest";
import { buildMapData } from "./map";

function makeTrip(lat: number | null, lng: number | null): TripPublic {
  return {
    id: "trip-1",
    name: "Viagem Teste",
    description: "",
    origin: "São Paulo",
    airport_code: "GRU",
    latitude: lat,
    longitude: lng,
    start_date: null,
    end_date: null,
    cover_image_key: null,
    cover_image_url: null,
    created_by: "user-1",
    created_at: "2026-01-01T00:00:00Z",
  };
}

function makeStop(id: string, order: number, lat: number | null, lng: number | null): StopPublic {
  return {
    id,
    trip_id: "trip-1",
    city: `Cidade ${id}`,
    airport_code: null,
    latitude: lat,
    longitude: lng,
    arrival_date: null,
    departure_date: null,
    cover_image_key: null,
    cover_image_url: null,
    order,
  };
}

function makeLeg(
  id: string,
  order: number,
  originId: string | null,
  destId: string | null,
): LegPublic {
  return {
    id,
    trip_id: "trip-1",
    origin_stop_id: originId,
    destination_stop_id: destId,
    target_date: null,
    order,
  };
}

describe("buildMapData", () => {
  it("retorna hasAllCoords=false sem paradas ou origem sem coords", () => {
    const trip = makeTrip(null, null);
    const result = buildMapData(trip, [], []);
    expect(result.hasAllCoords).toBe(false);
  });

  it("retorna hasAllCoords=true quando origem e paradas têm coords", () => {
    const trip = makeTrip(-23.5, -46.6);
    const stops = [makeStop("a", 0, -22.9, -43.2)];
    const legs = [makeLeg("l1", 0, null, "a"), makeLeg("l2", 1, "a", null)];
    const result = buildMapData(trip, stops, legs);
    expect(result.hasAllCoords).toBe(true);
  });

  it("hasAllCoords=false quando parada sem coords", () => {
    const trip = makeTrip(-23.5, -46.6);
    const stops = [makeStop("a", 0, null, null)];
    const result = buildMapData(trip, stops, []);
    expect(result.hasAllCoords).toBe(false);
  });

  it("pontos incluem origem + paradas ordenadas + retorno à origem", () => {
    const trip = makeTrip(-23.5, -46.6);
    const stops = [makeStop("a", 0, -22.9, -43.2), makeStop("b", 1, -15.8, -47.9)];
    const legs = [
      makeLeg("l1", 0, null, "a"),
      makeLeg("l2", 1, "a", "b"),
      makeLeg("l3", 2, "b", null),
    ];
    const result = buildMapData(trip, stops, legs);
    expect(result.points).toHaveLength(4); // origin + 2 stops + return
    expect(result.points[0].label).toBe("São Paulo");
    expect(result.points[1].label).toBe("Cidade a");
    expect(result.points[2].label).toBe("Cidade b");
    expect(result.points[3].label).toBe("São Paulo");
  });

  it("arcos conectam pontos consecutivos", () => {
    const trip = makeTrip(-23.5, -46.6);
    const stops = [makeStop("a", 0, -22.9, -43.2)];
    const legs = [makeLeg("l1", 0, null, "a"), makeLeg("l2", 1, "a", null)];
    const result = buildMapData(trip, stops, legs);
    expect(result.arcs).toHaveLength(2);
    expect(result.arcs[0].from.label).toBe("São Paulo");
    expect(result.arcs[0].to.label).toBe("Cidade a");
    expect(result.arcs[1].from.label).toBe("Cidade a");
    expect(result.arcs[1].to.label).toBe("São Paulo");
  });

  it("sem paradas: apenas ponto origem sem arcos", () => {
    const trip = makeTrip(-23.5, -46.6);
    const result = buildMapData(trip, [], []);
    expect(result.points).toHaveLength(1);
    expect(result.arcs).toHaveLength(0);
  });
});
