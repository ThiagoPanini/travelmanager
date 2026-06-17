import type {
  RouteCreate,
  RoutePublic,
  RouteUpdate,
  RouteWithSegments,
  SegmentCreate,
  SegmentPublic,
  SegmentUpdate,
} from "@traveltogether/types";

const apiUrl = () => process.env.TRAVELTOGETHER_API_URL ?? "http://localhost:8000";

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

function base(tripId: string, legId: string): string {
  return `${apiUrl()}/trips/${tripId}/legs/${legId}/routes`;
}

export async function getRoutes(
  accessToken: string,
  tripId: string,
  legId: string,
): Promise<RouteWithSegments[]> {
  try {
    const response = await fetch(base(tripId, legId), {
      cache: "no-store",
      headers: authHeaders(accessToken),
    });
    if (!response.ok) return [];
    return (await response.json()) as RouteWithSegments[];
  } catch {
    return [];
  }
}

export async function createRoute(
  accessToken: string,
  tripId: string,
  legId: string,
  data: RouteCreate,
): Promise<RouteWithSegments | null> {
  try {
    const response = await fetch(base(tripId, legId), {
      method: "POST",
      cache: "no-store",
      headers: authHeaders(accessToken),
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return (await response.json()) as RouteWithSegments;
  } catch {
    return null;
  }
}

export async function updateRoute(
  accessToken: string,
  tripId: string,
  legId: string,
  routeId: string,
  data: RouteUpdate,
): Promise<RoutePublic | null> {
  try {
    const response = await fetch(`${base(tripId, legId)}/${routeId}`, {
      method: "PATCH",
      cache: "no-store",
      headers: authHeaders(accessToken),
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return (await response.json()) as RoutePublic;
  } catch {
    return null;
  }
}

export async function deleteRoute(
  accessToken: string,
  tripId: string,
  legId: string,
  routeId: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${base(tripId, legId)}/${routeId}`, {
      method: "DELETE",
      cache: "no-store",
      headers: authHeaders(accessToken),
    });
    return response.status === 204;
  } catch {
    return false;
  }
}

export async function addSegment(
  accessToken: string,
  tripId: string,
  legId: string,
  routeId: string,
  data: SegmentCreate,
): Promise<SegmentPublic | null> {
  try {
    const response = await fetch(`${base(tripId, legId)}/${routeId}/segments`, {
      method: "POST",
      cache: "no-store",
      headers: authHeaders(accessToken),
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return (await response.json()) as SegmentPublic;
  } catch {
    return null;
  }
}

export async function updateSegment(
  accessToken: string,
  tripId: string,
  legId: string,
  routeId: string,
  segmentId: string,
  data: SegmentUpdate,
): Promise<SegmentPublic | null> {
  try {
    const response = await fetch(`${base(tripId, legId)}/${routeId}/segments/${segmentId}`, {
      method: "PATCH",
      cache: "no-store",
      headers: authHeaders(accessToken),
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return (await response.json()) as SegmentPublic;
  } catch {
    return null;
  }
}

export async function deleteSegment(
  accessToken: string,
  tripId: string,
  legId: string,
  routeId: string,
  segmentId: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${base(tripId, legId)}/${routeId}/segments/${segmentId}`, {
      method: "DELETE",
      cache: "no-store",
      headers: authHeaders(accessToken),
    });
    return response.status === 204;
  } catch {
    return false;
  }
}

export async function reorderSegments(
  accessToken: string,
  tripId: string,
  legId: string,
  routeId: string,
  segmentIds: string[],
): Promise<SegmentPublic[] | null> {
  try {
    const response = await fetch(`${base(tripId, legId)}/${routeId}/segments/reorder`, {
      method: "POST",
      cache: "no-store",
      headers: authHeaders(accessToken),
      body: JSON.stringify({ segment_ids: segmentIds }),
    });
    if (!response.ok) return null;
    return (await response.json()) as SegmentPublic[];
  } catch {
    return null;
  }
}
