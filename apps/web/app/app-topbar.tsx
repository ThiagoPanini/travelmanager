import Link from "next/link";

import { getAuthSession } from "@/auth";
import { Icon } from "@/components/atlas";

import { LogoutButton } from "./logout-button";
import { UtcClock } from "./utc-clock";

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
      <div className="shell topbar-in">
        <Link className="brand" href="/trips">
          <span className="brand-mark">
            <Icon name="plane" size={14} />
          </span>
          travel<em>together</em>
        </Link>
        <nav className="topnav">
          <Link className={active === "trips" ? "active" : ""} href="/trips">
            Viagens
          </Link>
        </nav>
        <div className="topbar-right">
          <UtcClock />
          <span className="avatar" title={session?.user?.email ?? undefined}>
            {avatarInitials(session?.user?.email)}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
