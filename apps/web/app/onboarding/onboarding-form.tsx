"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { COUNTRIES } from "@/lib/countries";
import { searchCities } from "@/lib/geo/cities";
import styles from "./onboarding.module.css";

const COUNTRY_OPTIONS: ComboboxOption[] = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
}));

type Step = 1 | 2;

/**
 * Wizard de onboarding em 2 passos (Fase 2, #215): captura o Perfil mínimo
 * (nome, país, cidade de origem) e grava via `POST /api/profile`.
 *
 * Passo 1 — nome. Passo 2 — país (combobox) + cidade (combobox gated pelo país,
 * com escape hatch para cidade fora do dataset GeoNames). Contrato da API
 * inalterado; `origin_city` continua string livre (ADR-0006).
 */
export function OnboardingForm({ defaultName = "" }: { defaultName?: string }) {
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState<Step>(1);
  const [displayName, setDisplayName] = useState(defaultName);
  const [country, setCountry] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const [countryOptions, setCountryOptions] = useState<ComboboxOption[]>(COUNTRY_OPTIONS);
  const [originCity, setOriginCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [cityOptions, setCityOptions] = useState<ComboboxOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const q = countryInput.toLowerCase();
    setCountryOptions(COUNTRY_OPTIONS.filter((o) => o.label.toLowerCase().includes(q)));
  }, [countryInput]);

  useEffect(() => {
    if (!country) {
      setCityOptions([]);
      return;
    }
    let cancelled = false;
    searchCities(country, cityInput).then((results) => {
      if (cancelled) return;
      setCityOptions(results.map((c) => ({ value: c.name, label: c.name })));
    });
    return () => {
      cancelled = true;
    };
  }, [country, cityInput]);

  function handleCountryChange(val: string) {
    setCountry(val);
    setOriginCity("");
    setCityInput("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          origin_city: originCity || cityInput.trim(),
          country,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      // O JWT carimbado no login ainda diz `needsOnboarding`; renova a sessão para
      // que o middleware não devolva a área logada ao /onboarding (#193).
      await update({ needsOnboarding: false });
      router.refresh();
      router.push("/app");
    } catch {
      setError("Não consegui salvar seu perfil agora. Confira os campos e tente de novo.");
      setPending(false);
    }
  }

  const totalSteps = 2;
  const progressPct = (step / totalSteps) * 100;

  return (
    <div className={styles.wizard}>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Passo ${step} de ${totalSteps}`}
      >
        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
      </div>
      <p className={styles.progressLabel}>
        Passo {step} de {totalSteps}
      </p>

      {step === 1 ? (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <label className={styles.field} htmlFor="display_name">
            <span className={`mono ${styles.label}`}>Como podemos te chamar?</span>
            <input
              id="display_name"
              type="text"
              name="display_name"
              required
              autoComplete="name"
              className={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
            />
          </label>
          <button type="submit" className={styles.primary} disabled={!displayName.trim()}>
            Próximo →
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <Combobox
            label="País"
            options={countryOptions}
            value={country}
            onChange={handleCountryChange}
            inputValue={countryInput}
            onInputChange={setCountryInput}
            placeholder="Selecione o país"
          />
          <Combobox
            label="Cidade de origem"
            options={cityOptions}
            value={originCity}
            onChange={setOriginCity}
            inputValue={cityInput}
            onInputChange={setCityInput}
            placeholder={country ? "Digite sua cidade" : "Escolha o país primeiro"}
            disabled={!country}
            escapeLabel="Minha cidade não está na lista — usar o que digitei"
          />
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={() => setStep(1)}>
              ← Voltar
            </button>
            <button
              type="submit"
              className={styles.primary}
              disabled={pending || !country || !(originCity || cityInput.trim())}
            >
              Concluir
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
