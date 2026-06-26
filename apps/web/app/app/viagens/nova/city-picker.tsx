"use client";

import { useEffect, useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { COUNTRIES } from "@/lib/countries";
import { type CityEntry, searchCities } from "@/lib/geo/cities";

/** Coordenadas de uma cidade escolhida do dataset (null em texto livre). */
export type CityCoords = { lat: number; lng: number } | null;

const COUNTRY_OPTIONS: ComboboxOption[] = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

function countryName(code: string | null): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? "";
}

type CityPickerProps = {
  /** Código do país selecionado (controlado pelo pai). */
  country: string | null;
  /** Cidade selecionada — só pra exibir o ✓; o pai detém a verdade. */
  city: string;
  /** Escolheu/limpou país (o pai deve resetar a cidade). */
  onCountry: (code: string | null) => void;
  /** Escolheu uma cidade — coords só quando vem do dataset (texto livre → null). */
  onCity: (city: string, coords: CityCoords) => void;
  countryLabel?: string;
  cityLabel?: string;
  countryPlaceholder?: string;
  cityPlaceholder?: string;
};

/**
 * Seletor país → cidade gated (combobox), reusando o seam `searchCities` (ADR-0006,
 * onboarding #215): o campo de cidade fica desabilitado até escolher o país e oferece
 * escape hatch (texto livre) quando a cidade não está no dataset GeoNames. Não toca o
 * contrato — só captura cidade/país (coords entram no PR do mapa, client-only).
 */
export function CityPicker({
  country,
  city,
  onCountry,
  onCity,
  countryLabel = "País",
  cityLabel = "Cidade",
  countryPlaceholder = "Buscar país",
  cityPlaceholder = "Buscar cidade",
}: CityPickerProps) {
  const [countryInput, setCountryInput] = useState(() => countryName(country));
  const [countryOptions, setCountryOptions] = useState<ComboboxOption[]>(COUNTRY_OPTIONS);
  const [cityInput, setCityInput] = useState(() => city);
  const [cityEntries, setCityEntries] = useState<CityEntry[]>([]);
  const cityOptions: ComboboxOption[] = cityEntries.map((c) => ({ value: c.name, label: c.name }));

  useEffect(() => {
    const q = countryInput.toLowerCase();
    setCountryOptions(COUNTRY_OPTIONS.filter((o) => o.label.toLowerCase().includes(q)));
  }, [countryInput]);

  useEffect(() => {
    if (!country) {
      setCityEntries([]);
      return;
    }
    let cancelled = false;
    searchCities(country, cityInput).then((results) => {
      if (cancelled) return;
      setCityEntries(results);
    });
    return () => {
      cancelled = true;
    };
  }, [country, cityInput]);

  function handleCountry(code: string) {
    onCountry(code || null);
    setCityInput("");
  }

  // Recupera coords ao escolher uma opção do dataset; texto livre vem sem coords.
  function handleCity(value: string) {
    const entry = cityEntries.find((c) => c.name === value);
    onCity(value, entry ? { lat: entry.lat, lng: entry.lng } : null);
  }

  return (
    <>
      <Combobox
        label={countryLabel}
        options={countryOptions}
        value={country ?? ""}
        onChange={handleCountry}
        inputValue={countryInput}
        onInputChange={setCountryInput}
        placeholder={countryPlaceholder}
      />
      <Combobox
        label={cityLabel}
        options={cityOptions}
        value={city}
        onChange={handleCity}
        inputValue={cityInput}
        onInputChange={setCityInput}
        placeholder={country ? cityPlaceholder : "Escolha o país primeiro"}
        disabled={!country}
        escapeLabel="Minha cidade não está na lista — usar o que digitei"
      />
    </>
  );
}
