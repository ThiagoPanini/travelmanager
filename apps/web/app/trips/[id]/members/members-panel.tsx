"use client";

import type { MemberWithUser, PendingMembershipPublic } from "@traveltogether/types";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Icon } from "@/components/atlas";
import { addMemberAction, removeMemberAction, updateMemberRoleAction } from "./actions";

interface Props {
  tripId: string;
  members: MemberWithUser[];
  pending: PendingMembershipPublic[];
  isOrganizer: boolean;
}

function initials(email: string): string {
  const [name = "tt", domain = ""] = email.split("@");
  return `${name[0] ?? "t"}${domain[0] ?? name[1] ?? "t"}`.toUpperCase();
}

export function MembersPanel({ tripId, members, pending, isOrganizer }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [addState, setAddState] = useState<"idle" | "submitting" | "error" | "ok">("idle");
  const [addMsg, setAddMsg] = useState("");

  const organizerCount = members.filter((m) => m.membership.role === "organizer").length;

  async function onAddMember(e: FormEvent) {
    e.preventDefault();
    setAddState("submitting");
    const result = await addMemberAction(tripId, email);
    if (result) {
      setEmail("");
      setAddState("ok");
      setAddMsg(
        result.pending ? `Convite pendente enviado para ${email}.` : `${email} adicionado.`,
      );
      router.refresh();
    } else {
      setAddState("error");
      setAddMsg("Não foi possível adicionar a pessoa.");
    }
  }

  async function onToggleRole(membershipId: string, role: "organizer" | "member") {
    await updateMemberRoleAction(
      tripId,
      membershipId,
      role === "organizer" ? "member" : "organizer",
    );
    router.refresh();
  }

  async function onRemove(membershipId: string) {
    await removeMemberAction(tripId, membershipId);
    router.refresh();
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="board">
          {members.map(({ membership, email: memberEmail }) => {
            const lastOrganizer = membership.role === "organizer" && organizerCount === 1;
            return (
              <div
                key={membership.id}
                className="board-row"
                style={{ gridTemplateColumns: "auto 1fr auto auto" }}
              >
                <span
                  className="avatar"
                  style={
                    membership.role === "organizer"
                      ? {}
                      : { background: "var(--chip-bg)", color: "var(--ink-soft)" }
                  }
                >
                  {initials(memberEmail)}
                </span>
                <div>
                  <div className="mono-num" style={{ fontSize: 13, color: "var(--ink)" }}>
                    {memberEmail}
                  </div>
                </div>
                <span className={`chip ${membership.role === "organizer" ? "green" : "outline"}`}>
                  {membership.role === "organizer" ? "organizador" : "membro"}
                </span>
                {isOrganizer ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="btn tiny ghost"
                      disabled={lastOrganizer}
                      onClick={() => onToggleRole(membership.id, membership.role)}
                      title={lastOrganizer ? "Toda viagem precisa de ao menos um organizador" : ""}
                      type="button"
                    >
                      {membership.role === "organizer" ? "Rebaixar" : "Promover"}
                    </button>
                    <button
                      className="icon-btn"
                      disabled={lastOrganizer}
                      onClick={() => onRemove(membership.id)}
                      title={
                        lastOrganizer
                          ? "Não é possível remover o último organizador"
                          : "Remover da viagem"
                      }
                      type="button"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: 22 }}>
          <div className="board">
            {pending.map((p) => (
              <div
                key={p.id}
                className="board-row"
                style={{ gridTemplateColumns: "auto 1fr auto" }}
              >
                <span
                  className="avatar"
                  style={{ background: "var(--chip-bg)", color: "var(--ink-soft)" }}
                >
                  ?
                </span>
                <div className="mono-num" style={{ fontSize: 13 }}>
                  {p.email}
                </div>
                <span className="chip outline">pendente</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOrganizer && (
        <form
          className="card flat"
          onSubmit={onAddMember}
          style={{ border: "1.5px dashed var(--line)", padding: "20px 22px" }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}
          >
            <label className="field">
              <span>Adicionar pessoa por e-mail</span>
              <input
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amigo@exemplo.com"
                required
                type="email"
                value={email}
              />
            </label>
            <button
              className="btn accent small"
              disabled={addState === "submitting" || !email.includes("@")}
              type="submit"
              style={{ height: 41 }}
            >
              <Icon name="plus" size={13} />{" "}
              {addState === "submitting" ? "Convidando…" : "Convidar"}
            </button>
          </div>
          <p className="hint" style={{ marginTop: 10 }}>
            No MVP, a pessoa precisa estar na allowlist da plataforma. Novos entram como membros
            (leitura + upvote).
          </p>
          {addMsg && (
            <p
              className="hint"
              role="status"
              style={{ marginTop: 8, color: addState === "error" ? "var(--danger)" : "var(--ok)" }}
            >
              {addMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
