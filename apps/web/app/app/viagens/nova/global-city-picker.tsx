"use client";

import { useEffect, useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { COUNTRIES } from "@/lib/countries";
import { type GlobalCityEntry, searchCitiesGlobal } from "@/lib/geo/cities";
import type { CityCoords } from "./city-picker";

type GlobalCityPickerProps = {
  onCity: (city: string, country: string | null, coords: CityCoords) => void;
};

function countryName(code: string): string {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code;
}

function cityKey(city: GlobalCityEntry): string {
  return `${city.country}:${city.name}:${city.lat}:${city.lng}`;
}

/** Busca global de cidade para Paradas; o resultado escolhido infere país e coordenadas. */
export function GlobalCityPicker({ onCity }: GlobalCityPickerProps) {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<GlobalCityEntry[]>([]);
  const options: ComboboxOption[] = entries.map((city) => ({
    value: cityKey(city),
    label: `${city.name} · ${countryName(city.country)}`,
  }));

  useEffect(() => {
    let cancelled = false;
    searchCitiesGlobal(input).then((results) => {
      if (!cancelled) setEntries(results);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  function handleCity(value: string) {
    if (!value.trim()) return;
    const entry = entries.find((city) => cityKey(city) === value);
    if (entry) {
      onCity(entry.name, entry.country, { lat: entry.lat, lng: entry.lng });
      return;
    }
    onCity(value, null, null);
  }

  return (
    <Combobox
      label="Cidade da parada"
      options={options}
      value=""
      onChange={handleCity}
      inputValue={input}
      onInputChange={setInput}
      placeholder="Buscar cidade"
      escapeLabel="Minha cidade não está na lista — usar o que digitei"
    />
  );
}
