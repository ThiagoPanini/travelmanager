import { notFound, redirect } from "next/navigation";

import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";
import { Breadcrumbs } from "@/components/atlas";
import { getTrip, getTripMembers } from "@/lib/api/trips";

import { MembersPanel } from "./members-panel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripMembersPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const { id } = await params;
  const [data, members] = await Promise.all([
    getTrip(session.apiAccessToken, id),
    getTripMembers(session.apiAccessToken, id),
  ]);

  if (!data || !members) notFound();

  const { trip, membership } = data;
  const isOrganizer = membership.role === "organizer";

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="page fadeup">
        <div className="shell" style={{ maxWidth: 820 }}>
          <Breadcrumbs
            items={[
              { label: "Viagens", href: "/trips" },
              { label: trip.name, href: `/trips/${id}` },
              { label: "Pessoas" },
            ]}
          />
          <div className="section-head" style={{ marginBottom: 24 }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                quem vai junto
              </div>
              <h1 className="display" style={{ fontSize: 34 }}>
                Pessoas da viagem
              </h1>
            </div>
          </div>

          <MembersPanel
            tripId={id}
            members={members.members}
            pending={members.pending}
            isOrganizer={isOrganizer}
          />
        </div>
      </main>
    </div>
  );
}
