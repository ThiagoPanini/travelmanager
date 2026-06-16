"use server";

import type { ExtraCreate, LodgingCreate } from "@traveltogether/types";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { createExtra, createLodging, deleteExtra, deleteLodging } from "@/lib/api/budget";

export async function createLodgingAction(tripId: string, data: LodgingCreate) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return createLodging(session.apiAccessToken, tripId, data);
}

export async function deleteLodgingAction(tripId: string, lodgingId: string) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return deleteLodging(session.apiAccessToken, tripId, lodgingId);
}

export async function createExtraAction(tripId: string, data: ExtraCreate) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return createExtra(session.apiAccessToken, tripId, data);
}

export async function deleteExtraAction(tripId: string, extraId: string) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return deleteExtra(session.apiAccessToken, tripId, extraId);
}
