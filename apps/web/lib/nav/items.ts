// Modelo de navegação do AppShell (direção Atlas). Mantido puro para teste:
// a definição dos itens e a resolução de "ativo" não dependem de React nem
// do roteador. O componente AppShell consome estes dados.

import type { IconName } from "@/components/atlas";

/** Chave do contador que alimenta o badge de um item (resolvido em runtime). */
export type NavBadgeKey = "pending" | "tasks" | "notifications";

export interface NavItem {
  href: string;
  /** Rótulo na sidebar (desktop). */
  label: string;
  /** Rótulo curto na tabbar (mobile). */
  shortLabel: string;
  icon: IconName;
  /** Qual contador alimenta o badge, se houver. */
  badge?: NavBadgeKey;
  /** Badge com cor de acento (laranja) em vez de neutro. */
  accent?: boolean;
  /** Aparece na tabbar mobile (espaço limitado a 5). */
  inTabbar: boolean;
}

/** Itens principais da navegação logada, na ordem da sidebar. */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/overview",
    label: "Visão geral",
    shortLabel: "Geral",
    icon: "grid",
    badge: "pending",
    accent: true,
    inTabbar: true,
  },
  { href: "/trips", label: "Viagens", shortLabel: "Viagens", icon: "compass", inTabbar: true },
  {
    href: "/tasks",
    label: "Tarefas",
    shortLabel: "Tarefas",
    icon: "checkSquare",
    badge: "tasks",
    inTabbar: true,
  },
  {
    href: "/activity",
    label: "Atividade",
    shortLabel: "Atividade",
    icon: "activity",
    inTabbar: false,
  },
  {
    href: "/notifications",
    label: "Notificações",
    shortLabel: "Avisos",
    icon: "bell",
    badge: "notifications",
    accent: true,
    inTabbar: true,
  },
];

/** Acesso ao Perfil — fora da nav principal, mas presente na tabbar mobile. */
export const PROFILE_NAV: NavItem = {
  href: "/profile",
  label: "Perfil",
  shortLabel: "Perfil",
  icon: "user",
  inTabbar: true,
};

/**
 * Item ativo quando a rota é exatamente o href ou um sub-caminho dele.
 * Ex.: `/trips/123` ativa "Viagens"; `/trips` também.
 */
export function isNavActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

/** Itens da tabbar mobile (máx. 5): principais marcados + Perfil. */
export function tabbarItems(): NavItem[] {
  return [...NAV_ITEMS.filter((item) => item.inTabbar), PROFILE_NAV];
}
