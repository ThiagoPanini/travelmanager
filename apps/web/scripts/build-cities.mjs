// @ts-nocheck
/**
 * Gera os recortes por país de `lib/geo/data/<CC>.json` a partir do dump
 * GeoNames `cities15000.txt` (CC-BY 4.0). Build-time, determinístico — a costura
 * `searchCities` (ADR-0006) consome esses JSONs por code-split.
 *
 * Regra: por país, as 80 cidades mais populosas (feature class P), ordenadas por
 * população desc. Cada entrada carrega nome, asciiName, lat/lng e população — as
 * coordenadas alimentam o mapa vetorial (ADR-0010). Coordenadas são **client-only**:
 * nunca entram no payload de criação de viagem (ADR-0011).
 *
 * Uso:
 *   1. baixe e descompacte https://download.geonames.org/export/dump/cities15000.zip
 *   2. node apps/web/scripts/build-cities.mjs <caminho/para/cities15000.txt>
 *
 * Para regenerar só o índice global a partir dos recortes versionados:
 *   node apps/web/scripts/build-cities.mjs --index-only
 *
 * GeoNames attribution: This product uses data from the GeoNames geographical
 * database (https://www.geonames.org), licensed under CC-BY 4.0.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Países suportados (espelha o select do onboarding — lib/countries.ts).
const COUNTRIES = [
  "BR",
  "PT",
  "AR",
  "CL",
  "UY",
  "PY",
  "CO",
  "PE",
  "MX",
  "US",
  "CA",
  "GB",
  "IE",
  "FR",
  "ES",
  "IT",
  "DE",
  "NL",
  "CH",
  "JP",
  "AU",
  "AO",
  "MZ",
];

const PER_COUNTRY = 80;

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "../lib/geo/data");

const source = process.argv[2];
if (!source) {
  console.error("uso: node build-cities.mjs <caminho/para/cities15000.txt|--index-only>");
  process.exit(1);
}

/** Junta os recortes versionados num índice global, com country code carimbado. */
function buildGlobalIndex() {
  const cities = COUNTRIES.flatMap((country) => {
    const entries = JSON.parse(readFileSync(resolve(dataDir, `${country}.json`), "utf8"));
    return entries.map((city) => ({ ...city, country }));
  }).sort((a, b) => b.population - a.population);

  writeFileSync(resolve(dataDir, "_all.json"), `${JSON.stringify(cities, null, 2)}\n`);
  console.log(`_all: ${cities.length} cidades`);
}

if (source === "--index-only") {
  buildGlobalIndex();
  process.exit(0);
}

/** Arredonda coordenada a 4 casas (~11 m) — precisão de sobra pra mapa esquemático. */
function round4(value) {
  return Math.round(Number(value) * 1e4) / 1e4;
}

const byCountry = new Map(COUNTRIES.map((cc) => [cc, []]));

const raw = readFileSync(source, "utf8");
for (const line of raw.split("\n")) {
  if (!line) continue;
  const f = line.split("\t");
  const cc = f[8];
  const bucket = byCountry.get(cc);
  if (!bucket) continue;
  bucket.push({
    name: f[1],
    asciiName: f[2],
    lat: round4(f[4]),
    lng: round4(f[5]),
    population: Number(f[14]) || 0,
  });
}

for (const cc of COUNTRIES) {
  const cities = byCountry
    .get(cc)
    .sort((a, b) => b.population - a.population)
    .slice(0, PER_COUNTRY);
  const out = `${JSON.stringify(cities, null, 2)}\n`;
  writeFileSync(resolve(dataDir, `${cc}.json`), out);
  console.log(`${cc}: ${cities.length} cidades`);
}

buildGlobalIndex();
