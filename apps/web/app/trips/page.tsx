import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { getTrips } from "@/lib/api/trips";
import { AppTopbar } from "../app-topbar";

function displayCode(value: string): string {
  const match = value.match(/\(([A-Za-z]{3})\)/);
  if (match) return match[1].toUpperCase();
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const letters = normalized.replace(/[^A-Za-z]/g, "").toUpperCase();
  return (letters.slice(0, 3) || "TT").padEnd(3, "X");
}

function coverTone(value: string): number {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
}

export default async function TripsPage() {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const items = await getTrips(session.apiAccessToken);

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="trips-shell">
        <header className="trips-header">
          <div>
            <p className="eyebrow">manifesto de embarques</p>
            <h1>Suas Viagens</h1>
          </div>
          <Link href="/trips/new" className="primary-button trip-new-btn">
            + Nova Viagem
          </Link>
        </header>

        {items.length === 0 ? (
          <p className="trips-empty">Nenhuma viagem ainda. Emita o primeiro cartão.</p>
        ) : (
          <ul className="trips-list">
            {items.map(({ trip, membership }) => {
              const originCode = displayCode(trip.origin);
              const tripCode = displayCode(trip.name);
              return (
                <li key={trip.id} className="bp bp-card">
                  <Link href={`/trips/${trip.id}`} className="bp-card-link">
                    <div className="cover" data-tone={coverTone(trip.name)}>
                      <span className="cover-skyline" />
                      <span className="cover-note">foto · destino</span>
                      <span className="cover-caption">{trip.name}</span>
                    </div>
                    <div className="bp-route">
                      <span className="bp-iata">{originCode}</span>
                      <span className="bp-path" aria-hidden="true">
                        <span className="line" />
                        <span className="plane">✈</span>
                      </span>
                      <span className="bp-iata">{tripCode}</span>
                    </div>
                    <span className="bp-name">{trip.name}</span>
                    <span className="bp-meta">
                      <span>Origem {trip.origin}</span>
                      <span>{new Date(trip.created_at).toLocaleDateString("pt-BR")}</span>
                    </span>
                    <span className="perf" />
                    <span className="bp-stub">
                      <span>
                        <span className="stub-label">papel</span>
                        <span className="trip-card-role" data-role={membership.role}>
                          {membership.role === "organizer" ? "Organizador" : "Membro"}
                        </span>
                      </span>
                      <span>
                        <span className="stub-label">origem</span>
                        <span className="stub-value">{originCode}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
