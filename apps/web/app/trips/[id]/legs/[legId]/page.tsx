import type { StopPublic } from "@traveltogether/types";
import { notFound, redirect } from "next/navigation";
import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";
import { Breadcrumbs } from "@/components/atlas";
import { getCurrentUser } from "@/lib/api/current-user";
import { getFares } from "@/lib/api/fares";
import { getRoutes } from "@/lib/api/routes";
import { getLegs, getStops, getTrip } from "@/lib/api/trips";
import { displayCode } from "@/lib/trips/journey";
import FaresPanel from "./fares-panel";
import RoutesPanel from "./routes-panel";

interface Props {
  params: Promise<{ id: string; legId: string }>;
}

function stopData(
  stopId: string | null,
  stops: StopPublic[],
  origin: string,
  originAirportCode: string | null,
): { city: string; code: string } {
  if (stopId === null) {
    return { city: origin, code: originAirportCode ?? displayCode(origin) };
  }
  const stop = stops.find((s) => s.id === stopId);
  if (!stop) return { city: "Parada", code: "PAR" };
  return { city: stop.city, code: stop.airport_code ?? displayCode(stop.city) };
}

export default async function LegFaresPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const { id, legId } = await params;
  const [data, stops, legs, fares, routes, currentUser] = await Promise.all([
    getTrip(session.apiAccessToken, id),
    getStops(session.apiAccessToken, id),
    getLegs(session.apiAccessToken, id),
    getFares(session.apiAccessToken, legId),
    getRoutes(session.apiAccessToken, id, legId),
    getCurrentUser(session.apiAccessToken),
  ]);
  if (!data) notFound();

  const { trip, membership } = data;
  const leg = legs.find((item) => item.id === legId);
  if (!leg) notFound();

  const from = stopData(leg.origin_stop_id, stops, trip.origin, trip.airport_code);
  const to = stopData(leg.destination_stop_id, stops, trip.origin, trip.airport_code);

  // `Trecho`s aéreos dos demais `Trajeto`s — candidatos a casar um bilhete
  // ida-e-volta (par invertido, geralmente no `Trajeto` de volta · ADR-0019).
  const token = session.apiAccessToken;
  const otherLegs = legs.filter((item) => item.id !== legId);
  const otherRoutes = await Promise.all(
    otherLegs.map((item) => getRoutes(token, id, item.id)),
  );
  const returnCandidates = otherRoutes
    .flat()
    .flatMap((route) => route.segments)
    .filter((seg) => seg.mode === "air")
    .map((seg) => ({
      id: seg.id,
      label: `${seg.origin_airport ?? "—"} → ${seg.destination_airport ?? "—"}`,
    }));

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="page fadeup">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Viagens", href: "/trips" },
              { label: trip.name, href: `/trips/${id}` },
              { label: `Trajeto ${from.code} → ${to.code}` },
            ]}
          />
          <RoutesPanel tripId={id} legId={legId} initialRoutes={routes} />
          <FaresPanel
            legId={legId}
            tripId={id}
            currentUserId={currentUser?.id ?? ""}
            initialFares={fares}
            role={membership.role}
            fromCode={from.code}
            toCode={to.code}
            fromCity={from.city}
            toCity={to.city}
            returnCandidates={returnCandidates}
          />
        </div>
      </main>
    </div>
  );
}
