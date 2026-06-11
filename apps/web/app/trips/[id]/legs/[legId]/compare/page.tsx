import { notFound, redirect } from "next/navigation";

import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";
import { Breadcrumbs } from "@/components/atlas";
import { getFares, getUpvote } from "@/lib/api/fares";
import { getTrip } from "@/lib/api/trips";
import type { FareRow } from "@/lib/compare-fares";
import ComparePanel from "./compare-panel";

interface Props {
  params: Promise<{ id: string; legId: string }>;
}

export default async function ComparePage({ params }: Props) {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const { id, legId } = await params;
  const [data, fares] = await Promise.all([
    getTrip(session.apiAccessToken, id),
    getFares(session.apiAccessToken, legId),
  ]);
  if (!data) notFound();

  const token = session.apiAccessToken;
  const upvotes = await Promise.all(fares.map((f) => getUpvote(token, f.id)));

  const rows: FareRow[] = fares.map((f, i) => ({ ...f, upvote_count: upvotes[i]?.count ?? 0 }));
  const { trip, membership } = data;

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="page fadeup">
        <div className="shell">
          <Breadcrumbs
            items={[
              { label: "Viagens", href: "/trips" },
              { label: trip.name, href: `/trips/${id}` },
              { label: "Passagens", href: `/trips/${id}/legs/${legId}` },
              { label: "Comparação" },
            ]}
          />
          <h1 className="display" style={{ fontSize: 30, marginBottom: 18 }}>
            Comparar pesquisas
          </h1>
          <ComparePanel legId={legId} initialRows={rows} role={membership.role} />
        </div>
      </main>
    </div>
  );
}
