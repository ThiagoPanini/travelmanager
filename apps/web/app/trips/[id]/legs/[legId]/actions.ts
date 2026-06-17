"use server";

import type { FareQuoteCreate } from "@traveltogether/types";
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
