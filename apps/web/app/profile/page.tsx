import { redirect } from "next/navigation";

import { AppTopbar } from "@/app/app-topbar";
import { getAuthSession } from "@/auth";
import { Breadcrumbs } from "@/components/atlas";
import { getCurrentUser } from "@/lib/api/current-user";
import { getNotificationPrefs } from "@/lib/api/notifications";

import { ConnectedLogins } from "./connected-logins";
import { NotificationPrefsPanel } from "./notification-prefs-panel";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const user = await getCurrentUser(session.apiAccessToken);
  if (!user) redirect("/login");

  const prefs = await getNotificationPrefs(session.apiAccessToken);

  return (
    <div className="app-shell">
      <AppTopbar />
      <main className="page fadeup">
        <div className="shell" style={{ maxWidth: 720 }}>
          <Breadcrumbs
            items={[{ label: "Viagens", href: "/trips" }, { label: "Perfil & conta" }]}
          />
          <h1 className="display" style={{ fontSize: 36, marginBottom: 6 }}>
            Perfil &amp; conta
          </h1>
          <p className="soft" style={{ marginBottom: 30 }}>
            Seu nome e avatar aparecem para o grupo no lugar do e-mail — no board de Membros e na
            autoria de cada Pesquisa de Passagem.
          </p>
          <div style={{ display: "grid", gap: 22 }}>
            <ProfileForm user={user} />
            {prefs && <NotificationPrefsPanel prefs={prefs} />}
            <ConnectedLogins provider={session.provider} />
          </div>
        </div>
      </main>
    </div>
  );
}
