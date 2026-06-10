import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { getCurrentUser } from "@/lib/api/current-user";
import { hasApiAccessToken } from "@/lib/identity/session";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getAuthSession();
  if (hasApiAccessToken(session)) {
    const currentUser = await getCurrentUser(session.apiAccessToken);
    if (currentUser) redirect("/trips");
  }

  return (
    <main className="auth-shell">
      <LoginForm />
    </main>
  );
}
