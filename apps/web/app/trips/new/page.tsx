import Link from "next/link";
import { redirect } from "next/navigation";

import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";

import { NewTripForm } from "./new-trip-form";

export default async function NewTripPage() {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="page narrow">
        <Link className="crumb" href="/trips">
          ← Viagens
        </Link>
        <NewTripForm />
      </main>
    </div>
  );
}
