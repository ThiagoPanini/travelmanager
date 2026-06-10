"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({ initials }: { initials: string }) {
  return (
    <button
      className="avatar"
      onClick={() => signOut({ callbackUrl: "/" })}
      title="Sair"
      type="button"
    >
      {initials}
    </button>
  );
}
