import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";
import { getFares } from "@/lib/api/fares";
import { getLegs, getStops, getTrip } from "@/lib/api/trips";
import FaresPanel from "./fares-panel";

interface Props {
  params: Promise<{ id: string; legId: string }>;
}

function stopLabel(
  stopId: string | null,
  stops: { id: string; city: string }[],
  origin: string,
): string {
  if (stopId === null) return origin;
  return stops.find((stop) => stop.id === stopId)?.city ?? "Parada";
}

function displayCode(value: string): string {
  const match = value.match(/\(([A-Za-z]{3})\)/);
  if (match) return match[1].toUpperCase();
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const letters = normalized.replace(/[^A-Za-z]/g, "").toUpperCase();
  return (letters.slice(0, 3) || "AIR").padEnd(3, "X");
}

export default async function LegFaresPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const { id, legId } = await params;
  const [data, stops, legs, fares] = await Promise.all([
    getTrip(session.apiAccessToken, id),
    getStops(session.apiAccessToken, id),
    getLegs(session.apiAccessToken, id),
    getFares(session.apiAccessToken, legId),
  ]);
  if (!data) notFound();

  const { trip, membership } = data;
  const leg = legs.find((item) => item.id === legId);
  if (!leg) notFound();

  const originLabel = stopLabel(leg.origin_stop_id, stops, trip.origin);
  const destinationLabel = stopLabel(leg.destination_stop_id, stops, trip.origin);

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="trips-shell">
        <Link className="crumb" href={`/trips/${id}`}>
          ← {trip.name}
        </Link>
        <header className="trips-header">
          <div>
            <h1>Pesquisas de Passagem</h1>
          </div>
          {fares.length > 0 && (
            <Link href={`/trips/${id}/legs/${legId}/compare`} className="secondary-button">
              Comparar
            </Link>
          )}
        </header>

        <FaresPanel
          legId={legId}
          initialFares={fares}
          role={membership.role}
          fromCode={displayCode(originLabel)}
          toCode={displayCode(destinationLabel)}
          fromCity={originLabel}
          toCity={destinationLabel}
        />
      </main>
    </div>
  );
}
