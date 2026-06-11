"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

type LoginState = "idle" | "submitting" | "closed-beta" | "error";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<LoginState>("idle");

  const isAccessDenied = state === "closed-beta" || Boolean(searchParams.get("error"));
  const message = isAccessDenied
    ? "Este e-mail não está autorizado para o projeto privado."
    : state === "error"
      ? "Não foi possível entrar agora."
      : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const result = await signIn("credentials", {
      email,
      redirect: false,
      callbackUrl: "/trips",
    });

    if (result?.ok) {
      router.replace(result.url ?? "/trips");
      router.refresh();
      return;
    }

    setState(result?.error === "CredentialsSignin" ? "closed-beta" : "error");
  }

  return (
    <div style={{ width: "min(420px, 92vw)" }}>
      <form className="card" onSubmit={onSubmit} style={{ padding: "36px 34px" }}>
        <div className="kicker" style={{ marginBottom: 14 }}>
          embarque
        </div>
        <h1 className="display" style={{ fontSize: 30, marginBottom: 8 }}>
          Identifique-se
        </h1>
        <p className="soft" style={{ fontSize: 14.5, marginBottom: 26 }}>
          Acesso privado: use o e-mail autorizado para entrar no beta fechado. Sem senha.
        </p>
        <div className="form-grid">
          <label className="field">
            <span>E-mail autorizado</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              required
              type="email"
              value={email}
            />
            <span className="hint">No MVP, somente e-mails na allowlist conseguem entrar.</span>
          </label>
          <button
            className="btn accent"
            disabled={state === "submitting"}
            style={{ justifyContent: "center" }}
            type="submit"
          >
            {state === "submitting" ? "Entrando…" : "Receber acesso"}
          </button>
        </div>
        {message && (
          <p
            className="hint"
            role="status"
            style={{ marginTop: 16, color: isAccessDenied ? "var(--danger)" : "var(--muted)" }}
          >
            {message}
          </p>
        )}
      </form>
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link className="link-btn" href="/" style={{ fontSize: 13 }}>
          ← Voltar à página inicial
        </Link>
      </div>
    </div>
  );
}
