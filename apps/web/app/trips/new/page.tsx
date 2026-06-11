import { redirect } from "next/navigation";

import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";
import { Breadcrumbs } from "@/components/atlas";

import { NewTripForm } from "./new-trip-form";

export default async function NewTripPage() {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  return (
    <div className="app-shell">
      <AppTopbar active="trips" />
      <main className="page fadeup">
        <div className="shell" style={{ maxWidth: 760 }}>
          <Breadcrumbs items={[{ label: "Viagens", href: "/trips" }, { label: "Nova viagem" }]} />
          <h1 className="display" style={{ fontSize: 36, marginBottom: 6 }}>
            Nova viagem
          </h1>
          <p className="soft" style={{ marginBottom: 34 }}>
            Defina o básico agora; paradas e passagens podem evoluir depois.
          </p>
          <NewTripForm />
        </div>
      </main>
    </div>
  );
}
