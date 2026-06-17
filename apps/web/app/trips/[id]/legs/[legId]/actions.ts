"use server";

import type { FareQuoteCreate, RouteCreate, SegmentCreate } from "@traveltogether/types";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/auth";
import {
  createFare,
  deleteFare,
  getUpvote,
  preferFare,
  purchaseFare,
  toggleUpvote,
} from "@/lib/api/fares";
import {
  addSegment,
  createRoute,
  deleteRoute,
  deleteSegment,
  reorderSegments,
} from "@/lib/api/routes";

async function token(): Promise<string> {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return session.apiAccessToken;
}

export async function createRouteAction(tripId: string, legId: string, data: RouteCreate) {
  return createRoute(await token(), tripId, legId, data);
}

export async function deleteRouteAction(tripId: string, legId: string, routeId: string) {
  return deleteRoute(await token(), tripId, legId, routeId);
}

export async function addSegmentAction(
  tripId: string,
  legId: string,
  routeId: string,
  data: SegmentCreate,
) {
  return addSegment(await token(), tripId, legId, routeId, data);
}

export async function deleteSegmentAction(
  tripId: string,
  legId: string,
  routeId: string,
  segmentId: string,
) {
  return deleteSegment(await token(), tripId, legId, routeId, segmentId);
}

export async function reorderSegmentsAction(
  tripId: string,
  legId: string,
  routeId: string,
  segmentIds: string[],
) {
  return reorderSegments(await token(), tripId, legId, routeId, segmentIds);
}

export async function createFareAction(legId: string, data: FareQuoteCreate) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return createFare(session.apiAccessToken, legId, data);
}

export async function deleteFareAction(legId: string, fareId: string) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return deleteFare(session.apiAccessToken, legId, fareId);
}

export async function getUpvoteAction(fareId: string) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return getUpvote(session.apiAccessToken, fareId);
}

export async function toggleUpvoteAction(fareId: string) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return toggleUpvote(session.apiAccessToken, fareId);
}

export async function preferFareAction(legId: string, fareId: string) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return preferFare(session.apiAccessToken, legId, fareId);
}

export async function purchaseFareAction(legId: string, fareId: string) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return purchaseFare(session.apiAccessToken, legId, fareId);
}
