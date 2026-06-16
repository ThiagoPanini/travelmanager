import type { LegPublic, StopPublic } from "@traveltogether/types";
import { describe, expect, it } from "vitest";

import { buildTripOverview } from "./overview";

function stop(id: string): StopPublic {
  return {
    id,
    trip_id: "t1",
    city: id,
    airport_code: null,
    latitude: null,
    longitude: null,
    arrival_date: null,
    departure_date: null,
    order: 0,
    cover_image_key: null,
    cover_image_url: null,
  };
}

function leg(id: string): LegPublic {
  return {
    id,
    trip_id: "t1",
    origin_stop_id: null,
    destination_stop_id: null,
    target_date: null,
    order: 0,
  };
}

describe("buildTripOverview", () => {
  it("conta paradas e trajetos", () => {
    const o = buildTripOverview([stop("a"), stop("b")], [leg("l1")], {});
    expect(o.stopCount).toBe(2);
    expect(o.legCount).toBe(1);
  });

  it("separa trajetos com Escolhida dos pendentes", () => {
    const o = buildTripOverview([], [leg("l1"), leg("l2")], { l1: true });
    expect(o.chosenCount).toBe(1);
    expect(o.pendingCount).toBe(1);
    expect(o.allDecided).toBe(false);
  });

  it("marca tudo decidido quando há trajetos e nenhum pendente", () => {
    const o = buildTripOverview([], [leg("l1")], { l1: true });
    expect(o.allDecided).toBe(true);
  });

  it("não considera decidida uma Viagem sem trajetos", () => {
    const o = buildTripOverview([], [], {});
    expect(o.allDecided).toBe(false);
  });
});
