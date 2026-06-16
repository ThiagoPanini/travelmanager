"use client";

import type { NotificationPrefsPublic } from "@traveltogether/types";
import { useState } from "react";

import { updateNotificationPrefsAction } from "@/app/actions/notifications";

type PrefKey = "decision" | "task" | "mention" | "digest";

const ROWS: { key: PrefKey; title: string; hint: string }[] = [
  {
    key: "decision",
    title: "Escolhida definida",
    hint: "Quando uma Pesquisa de Passagem vira a Escolhida de um Trajeto.",
  },
  {
    key: "task",
    title: "Tarefa designada",
    hint: "Quando você entra como Responsável de uma Tarefa.",
  },
  {
    key: "mention",
    title: "Menção em Comentário",
    hint: "Quando alguém te marca com @ em um Comentário.",
  },
  {
    key: "digest",
    title: "Resumo por e-mail",
    hint: "Um apanhado periódico do que andou acontecendo nas Viagens.",
  },
];

export function NotificationPrefsPanel({ prefs }: { prefs: NotificationPrefsPublic }) {
  const [values, setValues] = useState<Record<PrefKey, boolean>>({
    decision: prefs.decision,
    task: prefs.task,
    mention: prefs.mention,
    digest: prefs.digest,
  });
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function toggle(key: PrefKey) {
    const next = !values[key];
    setValues((prev) => ({ ...prev, [key]: next }));
    setState("saving");
    const result = await updateNotificationPrefsAction({ [key]: next });
    if (result) {
      setState("idle");
    } else {
      // Reverte o otimismo se a API recusar.
      setValues((prev) => ({ ...prev, [key]: !next }));
      setState("error");
    }
  }

  return (
    <section className="card" style={{ padding: "26px 28px" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        Preferências de notificação
      </h2>
      <p className="soft" style={{ fontSize: 14, marginBottom: 22 }}>
        Convites sempre chegam. O resto você controla aqui.
      </p>

      <div style={{ display: "grid", gap: 4 }}>
        {ROWS.map((row) => (
          <label
            key={row.key}
            className="pref-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 0",
              borderBottom: "1px solid var(--line-soft)",
              cursor: "pointer",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{row.title}</div>
              <div className="soft" style={{ fontSize: 13 }}>
                {row.hint}
              </div>
            </div>
            <input
              checked={values[row.key]}
              disabled={state === "saving"}
              onChange={() => toggle(row.key)}
              type="checkbox"
            />
          </label>
        ))}
      </div>

      {state === "error" && (
        <p className="hint" role="status" style={{ color: "var(--danger)", marginTop: 16 }}>
          Não foi possível salvar a preferência.
        </p>
      )}
    </section>
  );
}
