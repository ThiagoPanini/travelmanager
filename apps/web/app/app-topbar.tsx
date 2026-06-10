import Link from "next/link";

import { getAuthSession } from "@/auth";

import { LogoutButton } from "./logout-button";

interface Props {
  active?: "trips";
}

function avatarInitials(email: string | null | undefined): string {
  if (!email) return "TT";
  const [name = "", domain = ""] = email.split("@");
  return `${name[0] ?? "t"}${domain[0] ?? name[1] ?? "t"}`.toUpperCase();
}

export async function AppTopbar({ active }: Props) {
  const session = await getAuthSession();

  return (
    <header className="topbar">
      <Link className="wordmark" href="/trips">
        <span className="wordmark-ticket">TT</span>
        <span>traveltogether</span>
      </Link>
      <span className="nav-spacer" />
      <Link className={active === "trips" ? "nav-link on" : "nav-link"} href="/trips">
        VIAGENS
      </Link>
      <LogoutButton initials={avatarInitials(session?.user?.email)} />
    </header>
  );
}
