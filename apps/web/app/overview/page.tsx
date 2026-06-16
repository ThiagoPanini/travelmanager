import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/atlas";
import { activityHref, activityKindLabel } from "@/lib/activity/activity-item";
import { getRecentActivity } from "@/lib/api/activity";
import { getBudget } from "@/lib/api/budget";
import { getCurrentUser } from "@/lib/api/current-user";
import { getPendingActions } from "@/lib/api/pending";
import { getMyTasks } from "@/lib/api/tasks";
import { getTrips } from "@/lib/api/trips";
import { aggregateBudgetByCurrency } from "@/lib/dashboard/panel";
import { toPendingItem } from "@/lib/dashboard/pending";
import { buildMyTasksView } from "@/lib/tasks/my-tasks";
import { tripTabHref } from "@/lib/trips/tabs";

function fmtMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

// Painel (#111): home do usuário logado. Costura superfícies já construídas
// num panorama acionável — trajetos a decidir (#58), minhas Tarefas (#107),
// Orçamento por moeda (#95, sem conversão — Invariante 15) e Atividade (#100).
export default async function OverviewPage() {
  const session = await getAuthSession();
  if (!session?.apiAccessToken) redirect("/login");

  const accessToken = session.apiAccessToken;
  const [user, trips, pendingActions, tasks, activity] = await Promise.all([
    getCurrentUser(accessToken),
    getTrips(accessToken),
    getPendingActions(accessToken),
    getMyTasks(accessToken),
    getRecentActivity(accessToken, 6),
  ]);
  if (!user) redirect("/login");

  const budgets = (await Promise.all(trips.map((t) => getBudget(accessToken, t.trip.id)))).filter(
    (b): b is NonNullable<typeof b> => b !== null,
  );

  // "A decidir" no painel = pendências de Trajeto (Pesquisa de Passagem / Escolhida).
  const toDecide = pendingActions
    .filter((a) => a.kind !== "stop_without_itinerary")
    .map(toPendingItem);
  const tasksView = buildMyTasksView(tasks, trips);
  const openTasks = tasksView.columns
    .filter((c) => c.status !== "done")
    .flatMap((c) => c.tasks)
    .slice(0, 5);
  const budgetByCurrency = aggregateBudgetByCurrency(budgets);

  return (
    <AppShell user={user} counts={{ pending: toDecide.length, tasks: tasksView.count }}>
      <main className="page fadeup">
        <div className="shell">
          <div className="section-head" style={{ marginBottom: 28 }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                painel
              </div>
              <h1 className="display" style={{ fontSize: 38 }}>
                Olá, {user.display_name ?? "viajante"}
              </h1>
            </div>
            <span className="spacer" />
            <Link className="btn accent" href="/trips/new">
              <Icon name="plus" size={14} /> Nova viagem
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="empty">
              <Icon name="pin" size={22} />
              <div style={{ fontWeight: 600, color: "var(--ink-soft)" }}>
                Você ainda não está em nenhuma viagem.
              </div>
              <p className="soft" style={{ fontSize: 14, maxWidth: 420 }}>
                Crie a primeira viagem do grupo ou aceite um convite para começar a planejar.
              </p>
              <Link className="btn small accent" href="/trips/new">
                <Icon name="plus" size={13} /> Criar a primeira
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 26 }}>
              {/* Trajetos a decidir */}
              <section className="card flat" style={{ padding: "22px 24px" }}>
                <div className="section-head" style={{ marginBottom: 14 }}>
                  <span className="kicker">a decidir</span>
                  <span className="spacer" style={{ flex: 1 }} />
                  <span className="mono-num" style={{ fontSize: 12, color: "var(--muted)" }}>
                    {toDecide.length} trajeto{toDecide.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {toDecide.length === 0 ? (
                  <p className="soft" style={{ fontSize: 13.5 }}>
                    Nada pendente — todos os trajetos com a Escolhida marcada. ✦
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {toDecide.map((p) => (
                      <Link
                        key={`${p.kind}-${p.href}`}
                        className="card"
                        href={p.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <span style={{ color: "var(--accent)", display: "inline-flex" }}>
                          <Icon name="compass" size={16} />
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 14.5 }}>{p.verb}</span>
                        <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                          {p.target}
                        </span>
                        <span className="spacer" style={{ flex: 1 }} />
                        <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                          {p.tripName}
                        </span>
                        <Icon name="arrowRight" size={14} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Minhas Tarefas */}
              <section className="card flat" style={{ padding: "22px 24px" }}>
                <div className="section-head" style={{ marginBottom: 14 }}>
                  <span className="kicker">minhas tarefas</span>
                  <span className="spacer" style={{ flex: 1 }} />
                  <Link
                    className="mono"
                    href="/tasks"
                    style={{ fontSize: 11.5, color: "var(--accent)", textDecoration: "none" }}
                  >
                    ver board →
                  </Link>
                </div>
                {openTasks.length === 0 ? (
                  <p className="soft" style={{ fontSize: 13.5 }}>
                    Nenhuma tarefa aberta atribuída a você.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {openTasks.map((task) => (
                      <Link
                        key={task.id}
                        className="card"
                        href={tripTabHref(task.trip_id, "tasks")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <span className="chip outline" style={{ fontSize: 10 }}>
                          {task.status === "doing" ? "fazendo" : "a fazer"}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 14.5, textWrap: "pretty" }}>
                          {task.title}
                        </span>
                        <span className="spacer" style={{ flex: 1 }} />
                        <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                          {task.trip_name}
                        </span>
                        <Icon name="arrowRight" size={14} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Orçamento por moeda (sem conversão — Invariante 15) */}
              <section className="card flat" style={{ padding: "22px 24px" }}>
                <div className="section-head" style={{ marginBottom: 14 }}>
                  <span className="kicker">orçamento por moeda</span>
                </div>
                {budgetByCurrency.length === 0 ? (
                  <p className="soft" style={{ fontSize: 13.5 }}>
                    Sem Escolhidas marcadas ainda — o orçamento aparece quando os trajetos forem
                    decididos.
                  </p>
                ) : (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                      {budgetByCurrency.map((b) => (
                        <div
                          key={b.currency}
                          className="card"
                          style={{ padding: "14px 18px", minWidth: 150 }}
                        >
                          <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                            {b.currency}
                          </div>
                          <div
                            className="mono-num"
                            style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}
                          >
                            {fmtMoney(b.total, b.currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p
                      className="mono"
                      style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}
                    >
                      somado por moeda · sem conversão de câmbio
                    </p>
                  </>
                )}
              </section>

              {/* Atividade recente */}
              <section className="card flat" style={{ padding: "22px 24px" }}>
                <div className="section-head" style={{ marginBottom: 14 }}>
                  <span className="kicker">atividade recente</span>
                  <span className="spacer" style={{ flex: 1 }} />
                  <Link
                    className="mono"
                    href="/activity"
                    style={{ fontSize: 11.5, color: "var(--accent)", textDecoration: "none" }}
                  >
                    ver tudo →
                  </Link>
                </div>
                {activity.length === 0 ? (
                  <p className="soft" style={{ fontSize: 13.5 }}>
                    Nada por aqui ainda.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {activity.map((item) => (
                      <Link
                        key={item.id}
                        href={activityHref(item)}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 10,
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <span
                          className="chip outline"
                          style={{
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            flexShrink: 0,
                          }}
                        >
                          {activityKindLabel(item.kind)}
                        </span>
                        {item.actor_name && (
                          <span style={{ fontWeight: 600, fontSize: 13.5, flexShrink: 0 }}>
                            {item.actor_name}
                          </span>
                        )}
                        <span
                          className="soft"
                          style={{
                            fontSize: 13,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.body}
                        </span>
                        <span className="spacer" style={{ flex: 1 }} />
                        <span
                          className="mono"
                          style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}
                        >
                          {item.trip_name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
