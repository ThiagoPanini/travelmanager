/**
 * Esqueleto da Viagem **no web** — o espelho TS do `TripBackboneRead` (`GET /trips/{id}`,
 * contrato em `apps/api/.../trips/adapters/schemas.py`) e as derivações puras que o Painel
 * consome. `origin` e `entry_transfer` são de **quem vê** (a ponta é por-pessoa — inv. 6).
 *
 * Tudo aqui é puro e testável sem rede: o server component lê o backbone e passa adiante;
 * os helpers (data de partida, contador de embarque, avanço dos translados) não tocam `fetch`.
 */

import type { TransferKind } from "./draft";
import { isTransferDefined } from "./transfers";

/** Translado proposto no payload (snake-case `other_text`); `null` = sem proposta. */
export type TransferOut = { kind: TransferKind; other_text: string | null } | null;

/** Papel numa Participação/Convite (ADR-0002). */
export type Role = "organizer" | "member";

/** Parada exposta no backbone (ordenada por `position`; a última é o destino). */
export type StopRead = {
  id: string;
  position: number;
  city: string;
  country: string | null;
  arrival_date: string | null;
  /** Proposta do salto compartilhado parada[i-1]→parada[i]; sempre `null` no índice 0. */
  desired_transfer: TransferOut;
};

/** Membro **aceito** (bloco rico). */
export type MemberRead = {
  display_name: string | null;
  initials: string;
  city: string | null;
  role: Role;
  is_me: boolean;
};

/** Convite pendente (cego — só e-mail + papel; ADR-0002). */
export type PendingInvitation = { id: string; email: string; role: Role };

/** A tripulação: membros aceitos + convites pendentes (estes só para Organizadores). */
export type Crew = {
  members: MemberRead[];
  pending_invitations: PendingInvitation[];
};

/** Resposta de `GET /trips/{id}`: a rota + a tripulação, do ponto de vista de quem vê. */
export type TripBackbone = {
  id: string;
  name: string;
  description: string | null;
  departure_date: string | null;
  my_role: Role;
  origin: { city: string | null; country: string | null };
  entry_transfer: TransferOut;
  stops: StopRead[];
  crew: Crew;
};

const MONTHS_PT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Lê "YYYY-MM-DD" como data **local** (sem deslocamento de fuso — `new Date("2026-07-01")`
 * seria meia-noite UTC e poderia recuar um dia ao formatar). `null` se ausente/malformada.
 */
function parseIsoDate(value: string | null): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Data de partida legível: "2026-09-14" → "14 set 2026". `null` quando sem data. */
export function formatTripDate(value: string | null): string | null {
  const date = parseIsoDate(value);
  if (!date) return null;
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_PT[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Dias de `today` até a partida, em nível de **dia** (a hora não desconta um dia). `null`
 * sem data; pode ser `0` (hoje) ou negativo (partida no passado).
 */
export function daysUntilDeparture(value: string | null, today: Date): number | null {
  const date = parseIsoDate(value);
  if (!date) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - start.getTime()) / MS_PER_DAY);
}

/** Bloco "dias p/ embarque" do herói, já resolvido e null-safe. */
export type DepartureCountdown = {
  /** Número grande (ou "—"/"hoje" quando não há contagem de dias). */
  number: string;
  /** Legenda mono abaixo do número. */
  caption: string;
};

/**
 * Contagem de embarque do herói, honesta nas pontas: sem data → "datas a definir"; partida
 * passada → "já partiu"; hoje → "embarque"; senão o nº de dias (singular/plural no caption).
 */
export function departureCountdown(value: string | null, today: Date): DepartureCountdown {
  const days = daysUntilDeparture(value, today);
  if (days === null) {
    return { number: "—", caption: "datas a definir" };
  }
  if (days < 0) {
    return { number: "—", caption: "já partiu" };
  }
  if (days === 0) {
    return { number: "hoje", caption: "embarque" };
  }
  return { number: String(days), caption: days === 1 ? "dia p/ embarque" : "dias p/ embarque" };
}

/** Avanço dos translados **compartilhados** (parada[i≥1]); o forward-compat da progress strip. */
export type TransferProgress = {
  /** Saltos compartilhados com tipo concreto (≠ `undecided`/nulo). */
  proposed: number;
  /** Total de saltos compartilhados (denominador). */
  total: number;
  /** Saltos compartilhados ainda em discussão (`undecided`/nulo). */
  open: number;
};

/**
 * Conta quantos saltos **compartilhados** já têm translado proposto. A 1ª parada é a ponta
 * de entrada (por-pessoa, em `entry_transfer`) e fica de fora; só `stops[i≥1]` conta.
 * "Definido" reusa `isTransferDefined` (fonte única do que é translado pintado).
 */
export function summarizeSharedTransfers(stops: StopRead[]): TransferProgress {
  const shared = stops.slice(1);
  const total = shared.length;
  let proposed = 0;
  for (const item of shared) {
    if (isTransferDefined(item.desired_transfer)) {
      proposed += 1;
    }
  }
  return { proposed, total, open: total - proposed };
}
