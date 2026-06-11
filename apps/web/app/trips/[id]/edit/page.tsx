import { notFound, redirect } from "next/navigation";

import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";
import { Breadcrumbs } from "@/components/atlas";
import { getTrip } from "@/lib/api/trips";
import { dateOnly } from "@/lib/format/date";
import { EditTripForm } from "./edit-trip-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTripPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const { id } = await params;
  const data = await getTrip(session.apiAccessToken, id);
  if (!data) notFound();

  const { trip, membership } = data;
  // Só organizadores editam a viagem (a API também impõe isso).
  if (membership.role !== "organizer") redirect(`/trips/${id}`);

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="page fadeup">
        <div className="shell" style={{ maxWidth: 720 }}>
          <Breadcrumbs
            items={[
              { label: "Viagens", href: "/trips" },
              { label: trip.name, href: `/trips/${id}` },
              { label: "Editar" },
            ]}
          />

          <div className="section-head" style={{ marginBottom: 26 }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                editar viagem
              </div>
              <h1 className="display" style={{ fontSize: 32 }}>
                {trip.name}
              </h1>
            </div>
          </div>

          <EditTripForm
            initial={{
              name: trip.name,
              description: trip.description ?? "",
              origin: trip.origin,
              airport: trip.airport_code ?? "",
              start: dateOnly(trip.start_date) ?? "",
              end: dateOnly(trip.end_date) ?? "",
            }}
            tripId={id}
          />
        </div>
      </main>
    </div>
  );
}
