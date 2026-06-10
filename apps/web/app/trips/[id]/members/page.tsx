import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";
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
      <main className="trips-shell">
        <Link className="crumb" href={`/trips/${id}`}>
          ← {trip.name}
        </Link>
        <header className="trips-header">
          <div>
            <p className="eyebrow">manifesto de passageiros</p>
            <h1>Tripulação</h1>
            <p className="sub">
              Organizadores editam tudo; membros leem e dão upvote nas passagens.
            </p>
          </div>
        </header>

        <MembersPanel
          tripId={id}
          members={members.members}
          pending={members.pending}
          isOrganizer={isOrganizer}
        />
      </main>
    </div>
  );
}
