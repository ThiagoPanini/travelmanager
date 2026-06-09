"use server";

import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { createFare, deleteFare } from "@/lib/api/fares";
import type { FareQuoteCreate } from "@traveltogether/types";

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
