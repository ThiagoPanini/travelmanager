import { redirect } from "next/navigation";

import { DEFAULT_TRIP_TAB, resolveTripTab } from "@/lib/trips/tabs";
import TripDetail from "../../trip-detail";

interface Props {
  params: Promise<{ id: string; tab: string }>;
}

export default async function TripTabPage({ params }: Props) {
  const { id, tab } = await params;
  const activeTab = resolveTripTab(tab);
  // visão geral mora na raiz da Viagem; normaliza /t/overview e slugs inválidos
  if (activeTab === DEFAULT_TRIP_TAB) redirect(`/trips/${id}`);
  return <TripDetail id={id} activeTab={activeTab} />;
}
