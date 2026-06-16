"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Icon, UserAvatar } from "@/components/atlas";
import { displayLabel } from "@/lib/identity/user-display";
import { isNavActive, NAV_ITEMS, type NavBadgeKey, tabbarItems } from "@/lib/nav/items";

export interface ShellUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url?: string | null;
}

/** Contadores que alimentam os badges da nav. Preenchidos por fatias futuras. */
export interface NavCounts {
  pending?: number;
  tasks?: number;
  notifications?: number;
}

function countFor(key: NavBadgeKey | undefined, counts: NavCounts): number {
  if (!key) return 0;
  return counts[key] ?? 0;
}

/**
 * AppShell: casca de navegação das telas logadas (sidebar no desktop, header +
 * tabbar no mobile). As telas passam o Usuário e, opcionalmente, os contadores;
 * o estado "ativo" sai do pathname. Ver DESIGN.md (direção Atlas).
 */
export function AppShell({
  user,
  counts = {},
  children,
}: {
  user: ShellUser;
  counts?: NavCounts;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const label = displayLabel(user);
  const unread = countFor("notifications", counts);

  return (
    <div className="app">
      <aside className="sidebar">
        <Link className="brand" href="/overview">
          <span className="brand-mark">
            <Icon name="plane" size={14} />
          </span>
          travel<em>together</em>
        </Link>
        <Link className="btn accent side-cta" href="/trips/new">
          <Icon name="plus" size={14} /> Nova viagem
        </Link>
        <nav className="side-nav" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href, pathname);
            const n = countFor(item.badge, counts);
            return (
              <Link
                key={item.href}
                className={`side-link ${active ? "active" : ""}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                <span className="ico">
                  <Icon name={item.icon} size={17} />
                </span>
                {item.label}
                {n > 0 && <span className={`count ${item.accent ? "accent" : ""}`}>{n}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="side-spacer" />
        <Link
          className="side-user"
          href="/profile"
          aria-current={isNavActive("/profile", pathname) ? "page" : undefined}
        >
          <UserAvatar avatarUrl={user.avatar_url} label={label} seed={user.id} size={34} />
          <div style={{ minWidth: 0 }}>
            <div className="nm">{label}</div>
            <div className="em">{user.email}</div>
          </div>
        </Link>
      </aside>

      <div className="app-main">
        <div className="mtop">
          <Link className="brand" href="/overview">
            <span className="brand-mark">
              <Icon name="plane" size={13} />
            </span>
            travel<em>together</em>
          </Link>
          <span style={{ flex: 1 }} />
          <Link
            className="icon-btn"
            href="/notifications"
            aria-label="Notificações"
            style={{ position: "relative" }}
          >
            <Icon name="bell" size={18} />
            {unread > 0 && <span className="mtop-dot" />}
          </Link>
          <Link href="/profile" aria-label="Perfil" style={{ display: "inline-flex" }}>
            <UserAvatar avatarUrl={user.avatar_url} label={label} seed={user.id} size={30} />
          </Link>
        </div>

        {children}

        <nav className="tabbar" aria-label="Navegação">
          {tabbarItems().map((item) => {
            const active = isNavActive(item.href, pathname);
            const n = countFor(item.badge, counts);
            return (
              <Link
                key={item.href}
                className={active ? "active" : ""}
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                {n > 0 && <span className="dot" />}
                <Icon name={item.icon} size={20} />
                {item.shortLabel}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
