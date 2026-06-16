import type {
  ExtraPublic,
  FareQuotePublic,
  LegPublic,
  LodgingPublic,
  StopPublic,
} from "@traveltogether/types";
import { describe, expect, it } from "vitest";

import { buildBudgetSections, rateioLabel } from "./sections";

function stop(over: Partial<StopPublic> & { id: string; order: number }): StopPublic {
  return {
    trip_id: "t",
    city: "Cidade",
    airport_code: null,
    latitude: null,
    longitude: null,
    arrival_date: null,
    departure_date: null,
    cover_image_key: null,
    cover_image_url: null,
    ...over,
  };
}

function leg(over: Partial<LegPublic> & { id: string; order: number }): LegPublic {
  return {
    trip_id: "t",
    origin_stop_id: null,
    destination_stop_id: null,
    target_date: null,
    ...over,
  };
}

function fare(over: Partial<FareQuotePublic> & { id: string }): FareQuotePublic {
  return {
    leg_id: "l",
    registered_by: "u",
    created_at: "2026-01-01T00:00:00Z",
    value: "1000.00",
    currency: "BRL",
    flight_date: "2026-02-01",
    duration_minutes: 120,
    stops: 0,
    checked_baggage: true,
    origin_airport: "GRU",
    destination_airport: "LIS",
    airline: "TAP",
    link: "",
    notes: "",
    is_chosen: true,
    upvote_count: 0,
    user_voted: false,
    registered_by_display_name: null,
    registered_by_avatar_url: null,
    ...over,
  } as FareQuotePublic;
}

describe("buildBudgetSections — passagens", () => {
  it("rollup por Trajeto na ordem, lacuna sem Escolhida vira 'a decidir'", () => {
    const stops = [stop({ id: "s1", order: 0, city: "Lisboa" })];
    const legs = [
      leg({ id: "l1", order: 0, destination_stop_id: "s1" }),
      leg({ id: "l2", order: 1, origin_stop_id: "s1" }),
    ];
    const chosenFaresByLeg = {
      l1: fare({ id: "f1", leg_id: "l1", value: "2000.00", currency: "BRL" }),
      l2: null,
    };

    const sections = buildBudgetSections({
      originCity: "São Paulo",
      stops,
      legs,
      chosenFaresByLeg,
      lodgings: [],
      extras: [],
      summary: null,
    });

    expect(sections.fares).toHaveLength(2);
    expect(sections.fares[0]).toMatchObject({
      legId: "l1",
      label: "São Paulo → Lisboa",
      chosen: chosenFaresByLeg.l1,
    });
    expect(sections.fares[1]).toMatchObject({ legId: "l2", chosen: null });
    expect(sections.hasFareGaps).toBe(true);
  });
});

function lodging(over: Partial<LodgingPublic> & { id: string }): LodgingPublic {
  return {
    trip_id: "t",
    stop_id: "s1",
    description: "Hostel",
    nightly_value: "300.00",
    currency: "EUR",
    basis: "split",
    created_by: "u",
    created_at: "2026-01-01T00:00:00Z",
    ...over,
  };
}

function extra(over: Partial<ExtraPublic> & { id: string }): ExtraPublic {
  return {
    trip_id: "t",
    description: "Seguro",
    value: "150.00",
    currency: "BRL",
    basis: "per_person",
    created_by: "u",
    created_at: "2026-01-01T00:00:00Z",
    ...over,
  };
}

describe("buildBudgetSections — hospedagem", () => {
  it("linha ancorada à Parada com rótulo da cidade e noites pelas datas da Parada", () => {
    const stops = [
      stop({
        id: "s1",
        order: 0,
        city: "Lisboa",
        arrival_date: "2026-02-01T00:00:00",
        departure_date: "2026-02-04T00:00:00",
      }),
    ];
    const sections = buildBudgetSections({
      originCity: "São Paulo",
      stops,
      legs: [],
      chosenFaresByLeg: {},
      lodgings: [lodging({ id: "h1", stop_id: "s1" })],
      extras: [],
      summary: null,
    });

    expect(sections.lodgings).toHaveLength(1);
    expect(sections.lodgings[0]).toMatchObject({
      id: "h1",
      stopLabel: "Lisboa",
      nights: 3,
      currency: "EUR",
      basis: "split",
    });
  });

  it("Parada removida vira rótulo de fallback e noites 0 sem datas", () => {
    const sections = buildBudgetSections({
      originCity: "São Paulo",
      stops: [],
      legs: [],
      chosenFaresByLeg: {},
      lodgings: [lodging({ id: "h1", stop_id: "sumiu" })],
      extras: [],
      summary: null,
    });

    expect(sections.lodgings[0]).toMatchObject({ stopLabel: "Parada removida", nights: 0 });
  });
});

describe("buildBudgetSections — extras e subtotais", () => {
  it("repassa linhas de Extra preservando moeda e base de rateio", () => {
    const sections = buildBudgetSections({
      originCity: "São Paulo",
      stops: [],
      legs: [],
      chosenFaresByLeg: {},
      lodgings: [],
      extras: [extra({ id: "e1", description: "Seguro", value: "150.00", basis: "per_person" })],
      summary: null,
    });

    expect(sections.extras).toEqual([
      { id: "e1", description: "Seguro", value: "150.00", currency: "BRL", basis: "per_person" },
    ]);
  });

  it("subtotais vêm do resumo da API por moeda, sem conversão", () => {
    const sections = buildBudgetSections({
      originCity: "São Paulo",
      stops: [],
      legs: [],
      chosenFaresByLeg: {},
      lodgings: [],
      extras: [],
      summary: {
        member_count: 4,
        subtotals: [
          { currency: "BRL", per_group: "8000.00", per_person: "2000.00" },
          { currency: "EUR", per_group: "1200.00", per_person: "300.00" },
        ],
      },
    });

    expect(sections.memberCount).toBe(4);
    expect(sections.subtotals).toEqual([
      { currency: "BRL", perGroup: "8000.00", perPerson: "2000.00" },
      { currency: "EUR", perGroup: "1200.00", perPerson: "300.00" },
    ]);
  });

  it("isEmpty só quando não há Escolhida, Hospedagem nem Extra", () => {
    const empty = buildBudgetSections({
      originCity: "São Paulo",
      stops: [],
      legs: [leg({ id: "l1", order: 0 })],
      chosenFaresByLeg: { l1: null },
      lodgings: [],
      extras: [],
      summary: null,
    });
    expect(empty.isEmpty).toBe(true);

    const withExtra = buildBudgetSections({
      originCity: "São Paulo",
      stops: [],
      legs: [],
      chosenFaresByLeg: {},
      lodgings: [],
      extras: [extra({ id: "e1" })],
      summary: null,
    });
    expect(withExtra.isEmpty).toBe(false);
  });
});

describe("rateioLabel", () => {
  it("traduz a base de rateio para rótulo pt-BR", () => {
    expect(rateioLabel("per_person")).toBe("por pessoa");
    expect(rateioLabel("split")).toBe("rateado no grupo");
  });
});
