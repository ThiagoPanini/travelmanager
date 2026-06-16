import Link from "next/link";

import { TRIP_TAB_LABELS, TRIP_TABS, type TripTab, tripTabHref } from "@/lib/trips/tabs";

interface Props {
  tripId: string;
  activeTab: TripTab;
}

export default function TripTabs({ tripId, activeTab }: Props) {
  return (
    <nav className="trip-tabnav" aria-label="Seções da viagem">
      {TRIP_TABS.map((tab) => (
        <Link
          key={tab}
          href={tripTabHref(tripId, tab)}
          className={tab === activeTab ? "active" : ""}
          aria-current={tab === activeTab ? "page" : undefined}
        >
          {TRIP_TAB_LABELS[tab]}
        </Link>
      ))}
    </nav>
  );
}
