import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { Code, CoverGraphic, Icon } from "@/components/atlas";
import { getTrips } from "@/lib/api/trips";
import { formatDateRange } from "@/lib/format/date";
import { displayCode } from "@/lib/trips/journey";
import { AppTopbar } from "../app-topbar";

export default async function TripsPage() {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const items = await getTrips(session.apiAccessToken);

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="page fadeup">
        <div className="shell">
          <div className="section-head" style={{ marginBottom: 28 }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                painel de viagens
              </div>
              <h1 className="display" style={{ fontSize: 38 }}>
                Suas viagens
              </h1>
            </div>
            <span className="spacer" />
            <Link className="btn accent" href="/trips/new">
              <Icon name="plus" size={14} /> Nova viagem
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="empty">
              <Icon name="pin" size={22} />
              <div style={{ fontWeight: 600, color: "var(--ink-soft)" }}>Nenhuma viagem ainda.</div>
              <Link className="btn small accent" href="/trips/new">
                <Icon name="plus" size={13} /> Criar a primeira
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {items.map(({ trip, membership, stops }) => {
                const codes = stops.length
                  ? stops.map((s) => s.airport_code ?? displayCode(s.city)).join(" · ")
                  : (trip.airport_code ?? displayCode(trip.origin));
                const route = [
                  { key: "origin", code: trip.airport_code ?? displayCode(trip.origin) },
                  ...stops.map((stop) => ({
                    key: stop.id,
                    code: stop.airport_code ?? displayCode(stop.city),
                  })),
                  { key: "return", code: trip.airport_code ?? displayCode(trip.origin) },
                ];
                return (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="card"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "180px 1fr",
                      overflow: "hidden",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <CoverGraphic seedText={trip.id} codeLabel={codes} height="100%" />
                    <div
                      style={{
                        padding: "22px 26px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 14,
                          flexWrap: "wrap",
                        }}
                      >
                        <h2 className="display" style={{ fontSize: 23 }}>
                          {trip.name}
                        </h2>
                        <span
                          className="mono-num"
                          style={{ fontSize: 12.5, color: "var(--muted)" }}
                        >
                          {formatDateRange(trip.start_date, trip.end_date)}
                        </span>
                        <span className="spacer" style={{ flex: 1 }} />
                        {membership.role === "organizer" && (
                          <span className="chip green">organizador</span>
                        )}
                      </div>
                      {trip.description && (
                        <p className="soft" style={{ fontSize: 14, maxWidth: 600 }}>
                          {trip.description}
                        </p>
                      )}
                      {stops.length ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                            marginTop: 2,
                          }}
                        >
                          {route.map((point, index) => (
                            <span
                              key={point.key}
                              style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
                            >
                              {index > 0 && (
                                <span style={{ color: "var(--muted)", fontSize: 12 }}>→</span>
                              )}
                              <Code code={point.code} size="sm" />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="chip outline" style={{ alignSelf: "flex-start" }}>
                          sem paradas definidas
                        </span>
                      )}
                      <div style={{ marginTop: "auto", paddingTop: 6 }}>
                        <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                          {stops.length} parada{stops.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
