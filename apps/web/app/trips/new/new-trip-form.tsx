"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createTripAction } from "./actions";

type FormState = "idle" | "submitting" | "error";

export function NewTripForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>("idle");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const result = await createTripAction({ name, description, origin });
    if (result) {
      router.push(`/trips/${result.trip.id}`);
      router.refresh();
    } else {
      setState("error");
    }
  }

  return (
    <form className="bp" onSubmit={onSubmit}>
      <div className="bp-head">
        <span>Check-in</span>
        <span className="flight">Nova Viagem</span>
      </div>

      <div className="form-card">
        <label className="field">
          <span>Nome da viagem</span>
          <input
            name="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="Eurotrip da Galera"
            required
            type="text"
            value={name}
          />
        </label>

        <label className="field">
          <span>Origem — cidade de partida</span>
          <input
            name="origin"
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="São Paulo (GRU)"
            required
            type="text"
            value={origin}
          />
        </label>

        <label className="field">
          <span>Descrição (opcional)</span>
          <textarea
            name="description"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Uma frase pra dar o tom da viagem"
            value={description}
          />
        </label>

        <button
          className="primary-button"
          disabled={state === "submitting"}
          style={{ width: "100%" }}
          type="submit"
        >
          {state === "submitting" ? "Emitindo…" : "Emitir cartão de embarque"}
        </button>

        {state === "error" && (
          <p className="login-message" role="status">
            Não foi possível criar a viagem.
          </p>
        )}
      </div>
    </form>
  );
}
