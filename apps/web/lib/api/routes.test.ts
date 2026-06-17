import { afterEach, describe, expect, it, vi } from "vitest";

import { addSegment, createRoute, deleteRoute, getRoutes, reorderSegments } from "./routes";

const ROUTE: import("@traveltogether/types").RouteWithSegments = {
  id: "route-1",
  leg_id: "leg-1",
  label: "via Miami",
  order: 2,
  created_by: "user-1",
  created_at: "2026-01-01T00:00:00Z",
  segments: [
    {
      id: "seg-1",
      route_id: "route-1",
      mode: "air",
      origin_airport: "GRU",
      destination_airport: "MIA",
      order: 1,
    },
  ],
};

describe("getRoutes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lista as Rotas com seus Trechos", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([ROUTE]) }),
    );
    await expect(getRoutes("token", "trip-1", "leg-1")).resolves.toEqual([ROUTE]);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/trips/trip-1/legs/leg-1/routes",
      expect.any(Object),
    );
  });

  it("retorna vazio quando API falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    await expect(getRoutes("token", "trip-1", "leg-1")).resolves.toEqual([]);
  });
});

describe("createRoute", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("envia POST com label", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(ROUTE) }),
    );
    await expect(createRoute("token", "trip-1", "leg-1", { label: "via Miami" })).resolves.toEqual(
      ROUTE,
    );
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/trips/trip-1/legs/leg-1/routes",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("addSegment", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("envia POST no endpoint de segments", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(ROUTE.segments[0]) }),
    );
    await expect(
      addSegment("token", "trip-1", "leg-1", "route-1", {
        origin_airport: "GRU",
        destination_airport: "MIA",
      }),
    ).resolves.toEqual(ROUTE.segments[0]);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/trips/trip-1/legs/leg-1/routes/route-1/segments",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("reorderSegments", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("envia POST no endpoint reorder", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(ROUTE.segments) }),
    );
    await expect(
      reorderSegments("token", "trip-1", "leg-1", "route-1", ["seg-1"]),
    ).resolves.toEqual(ROUTE.segments);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/trips/trip-1/legs/leg-1/routes/route-1/segments/reorder",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("deleteRoute", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("retorna true em 204", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 204 }));
    await expect(deleteRoute("token", "trip-1", "leg-1", "route-1")).resolves.toBe(true);
  });

  it("retorna false em 403", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 403 }));
    await expect(deleteRoute("token", "trip-1", "leg-1", "route-1")).resolves.toBe(false);
  });
});
