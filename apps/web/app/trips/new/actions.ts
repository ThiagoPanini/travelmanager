"use server";

import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { createStop, createTrip } from "@/lib/api/trips";

interface NewStopInput {
  city: string;
  airport_code?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
}

export async function createTripAction(data: {
  name: string;
  description: string;
  origin: string;
  airport_code?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");
  return createTrip(session.apiAccessToken, data);
}

export async function createTripWithStopsAction(
  data: {
    name: string;
    description: string;
    origin: string;
    airport_code?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  },
  stops: NewStopInput[],
) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const trip = await createTrip(session.apiAccessToken, data);
  if (!trip) return null;

  // As paradas são criadas na ordem informada; os Trajetos são derivados
  // automaticamente pela API a partir dessa ordem (CONTEXT.md, invariante 8).
  for (const stop of stops) {
    await createStop(session.apiAccessToken, trip.trip.id, stop);
  }

  return trip;
}
