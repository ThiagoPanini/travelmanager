import type {
  ActivityItemPublic,
  BudgetSummary,
  MembershipPublic,
  NotificationInbox,
  PendingActionPublic,
  StopPublic,
  TaskWithAssignees,
  TripPublic,
  TripSummary,
} from "@traveltogether/types";

import type { StackMember } from "@/components/atlas";
import { buildPanelData, type PanelData, type PanelInput } from "../dashboard/panel-data";

// Painel de exemplo da Home (DemoOverlay #137). Fixture estática derivada 1:1 do
// `ttSeed` do protótipo: a "Eurotrip do grupo", São Paulo (GRU) →
// Lisboa (LIS) → Paris (CDG) → Roma (FCO) → de volta, 4 viajantes. GRU→LIS já
// tem a Escolhida marcada; os demais Trajetos ainda esperam decisão.
//
// Tudo é tipado contra as DTOs `*Public` e passa pelo MESMO `buildPanelData`
// das telas reais — sem chamada de API, sem sessão, sem seed de banco. O `now`
// é fixo para a contagem regressiva ser determinística (espelha o TT_TODAY do
// protótipo). O resultado alimenta `<PanelView data readOnly />` no overlay.

// Hoje, congelado (TT_TODAY do protótipo). Embarque em 2026-09-10.
const NOW = new Date("2026-06-14T09:00:00");

const TRIP_ID = "demo-eurotrip";

const MEMBERS: StackMember[] = [
  { seed: "u1", label: "Thiago Panini" },
  { seed: "u2", label: "Marina Costa" },
  { seed: "u3", label: "Rafael Lima" },
  { seed: "u4", label: "Júlia Andrade" },
];

const trip: TripPublic = {
  id: TRIP_ID,
  name: "Eurotrip do grupo",
  description: "Duas semanas entre Lisboa, Paris e Roma.",
  origin: "São Paulo",
  airport_code: "GRU",
  latitude: null,
  longitude: null,
  start_date: "2026-09-10",
  end_date: "2026-09-24",
  cover_image_key: null,
  cover_image_url: null,
  created_by: "u1",
  created_at: "2026-05-01T12:00:00",
};

const membership: MembershipPublic = {
  id: "demo-m1",
  trip_id: TRIP_ID,
  user_id: "u1",
  role: "organizer",
  joined_at: "2026-05-01T12:00:00",
};

function stop(
  id: string,
  city: string,
  code: string,
  arrival: string,
  departure: string,
  order: number,
): StopPublic {
  return {
    id,
    trip_id: TRIP_ID,
    city,
    airport_code: code,
    latitude: null,
    longitude: null,
    arrival_date: arrival,
    departure_date: departure,
    cover_image_key: null,
    cover_image_url: null,
    order,
  };
}

const stops: StopPublic[] = [
  stop("s1", "Lisboa", "LIS", "2026-09-10", "2026-09-15", 0),
  stop("s2", "Paris", "CDG", "2026-09-15", "2026-09-20", 1),
  stop("s3", "Roma", "FCO", "2026-09-20", "2026-09-24", 2),
];

const nextTrip: TripSummary = { trip, membership, stops, cover_image_url: null };

// Pendências derivadas do estado dos Trajetos (origem→paradas→origem):
// GRU→LIS decidido (some daqui); LIS→CDG e CDG→FCO têm Pesquisas mas sem
// Escolhida; FCO→GRU ainda sem nenhuma Pesquisa; Roma sem Roteiro.
const pending: PendingActionPublic[] = [
  {
    kind: "leg_without_my_preference",
    trip_id: TRIP_ID,
    trip_name: trip.name,
    target_kind: "leg",
    target_id: "leg-lis-cdg",
    label: "LIS → CDG",
  },
  {
    kind: "leg_without_my_preference",
    trip_id: TRIP_ID,
    trip_name: trip.name,
    target_kind: "leg",
    target_id: "leg-cdg-fco",
    label: "CDG → FCO",
  },
  {
    kind: "leg_without_fare",
    trip_id: TRIP_ID,
    trip_name: trip.name,
    target_kind: "leg",
    target_id: "leg-fco-gru",
    label: "FCO → GRU",
  },
  {
    kind: "stop_without_itinerary",
    trip_id: TRIP_ID,
    trip_name: trip.name,
    target_kind: "stop",
    target_id: "s3",
    label: "Roma",
  },
];

function task(id: string, title: string, status: TaskWithAssignees["status"]): TaskWithAssignees {
  return {
    id,
    trip_id: TRIP_ID,
    title,
    description: "",
    due_date: null,
    status,
    anchor_type: null,
    anchor_id: null,
    created_by: "u1",
    created_at: "2026-05-20T12:00:00",
    updated_at: "2026-05-20T12:00:00",
    assignee_ids: ["u1"],
    assignees: [{ user_id: "u1", display_name: "Thiago Panini", avatar_url: null }],
  };
}

const tasks: TaskWithAssignees[] = [
  task("k1", "Emitir a passagem GRU → Lisboa", "doing"),
  task("k2", "Decidir a passagem Lisboa → Paris", "todo"),
  task("k3", "Reservar o hostel em Lisboa", "todo"),
  task("k4", "Cotar seguro viagem do grupo", "todo"),
  task("k5", "Comprar o ingresso do Louvre", "done"),
];

function activity(
  id: string,
  kind: ActivityItemPublic["kind"],
  actorName: string,
  body: string,
  occurredAt: string,
): ActivityItemPublic {
  return {
    id,
    kind,
    trip_id: TRIP_ID,
    trip_name: trip.name,
    actor_name: actorName,
    body,
    occurred_at: occurredAt,
  };
}

const activityFeed: ActivityItemPublic[] = [
  activity(
    "g1",
    "fare_registered",
    "Marina Costa",
    "registrou a TAP em GRU → Lisboa",
    "2026-06-13T18:20:00",
  ),
  activity(
    "g2",
    "comment",
    "Rafael Lima",
    "comentou na Pesquisa da TAP: bagagem inclusa, fechou",
    "2026-06-13T17:05:00",
  ),
  activity("g3", "member_joined", "Júlia Andrade", "entrou na Viagem", "2026-06-12T09:40:00"),
  activity(
    "g4",
    "comment",
    "Thiago Panini",
    "comentou no Roteiro de Lisboa: bora marcar o Castelo de São Jorge",
    "2026-06-11T21:15:00",
  ),
  activity(
    "g5",
    "fare_registered",
    "Rafael Lima",
    "registrou a Vueling em LIS → CDG",
    "2026-06-10T14:30:00",
  ),
];

const notifications: NotificationInbox = {
  unread_count: 3,
  items: [
    {
      id: "n1",
      kind: "mention",
      trip_id: TRIP_ID,
      target_type: "leg",
      target_id: "leg-gru-lis",
      text: "Rafael te marcou em GRU → Lisboa: “fechou a TAP por R$ 4.280 como sua Preferida?”",
      read_at: null,
      created_at: "2026-06-13T18:21:00",
    },
    {
      id: "n2",
      kind: "task",
      trip_id: TRIP_ID,
      target_type: "task",
      target_id: "k1",
      text: "Você virou Responsável por Emitir a passagem GRU → Lisboa.",
      read_at: null,
      created_at: "2026-06-13T10:00:00",
    },
    {
      id: "n3",
      kind: "mention",
      trip_id: TRIP_ID,
      target_type: "comment",
      target_id: "c1",
      text: "Marina mencionou você num comentário do Roteiro de Lisboa.",
      read_at: null,
      created_at: "2026-06-11T21:16:00",
    },
  ],
};

// Orçamento por moeda (Invariante 15, ADR-0016): hospedagem em EUR e extras em
// BRL convivem em linhas separadas, JAMAIS somadas. 4 viajantes.
const heroBudget: BudgetSummary = {
  member_count: 4,
  subtotals: [
    { currency: "EUR", per_group: "2240.00", per_person: "560.00" },
    { currency: "BRL", per_group: "1520.00", per_person: "380.00" },
  ],
};

export const EXAMPLE_PANEL_INPUT: PanelInput = {
  userName: "Thiago Panini",
  now: NOW,
  nextTrip,
  trips: [nextTrip],
  pending,
  tasks,
  activity: activityFeed,
  notifications,
  heroBudget,
  heroMembers: MEMBERS,
};

export const EXAMPLE_PANEL_DATA: PanelData = buildPanelData(EXAMPLE_PANEL_INPUT);
