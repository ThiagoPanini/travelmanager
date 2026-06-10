"use client";

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
    <form className="auth-bp bp" onSubmit={onSubmit}>
      <div className="bp-head">
        <span>Boarding pass</span>
        <span className="flight">TT · beta</span>
      </div>
      <div className="auth-body">
        <div className="auth-brand">
          <span className="wordmark-ticket">TT</span>
          traveltogether
        </div>
        <div className="login-heading">
          <p>Acesso privado</p>
          <h1>Check-in da galera</h1>
        </div>
        <p className="sub">
          Beta fechado. Só embarca quem está na lista — use o e-mail do convite.
        </p>
        <div className="auth-route" aria-hidden="true">
          <span className="iata">VOCÊ</span>
          <span className="line" />
          <span className="plane">✈</span>
          <span className="line" />
          <span className="iata">∞</span>
        </div>
        <label className="login-field">
          <span>E-mail do passageiro</span>
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        <button
          className="primary-button"
          disabled={state === "submitting"}
          style={{ width: "100%" }}
          type="submit"
        >
          {state === "submitting" ? "Embarcando…" : "Embarcar"}
        </button>
        <p className={isAccessDenied ? "login-message is-denied" : "login-message"} role="status">
          {message}
        </p>
        <p className="hint">Sem convite? Peça para um organizador te adicionar.</p>
      </div>
    </form>
  );
}
