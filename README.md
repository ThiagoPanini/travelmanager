# travel·manager

Caderno de bordo compartilhado para planejar viagens em grupo: o grupo cadastra a
viagem, desenha as paradas cidade a cidade e pesquisa o translado entre cada parada,
decidindo junto. Linguagem e invariantes de domínio em [`CONTEXT.md`](CONTEXT.md);
decisões em [`docs/adr/`](docs/adr/); sistema visual em [`docs/design/`](docs/design/).

## Monorepo

| App | Stack | Pasta |
|---|---|---|
| Web | Next.js (App Router) | [`apps/web`](apps/web) |
| API | FastAPI | [`apps/api`](apps/api) |

## Desenvolvimento local

Pré-requisitos: Node 24 (`.node-version`), [pnpm](https://pnpm.io) 11, [uv](https://docs.astral.sh/uv/), Docker.

### 1. Variáveis de ambiente

Cada app lê suas variáveis do próprio diretório — o `uv run` e o Next.js não leem da raiz do monorepo.

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```

`SESSION_PEPPER` pode ficar vazio — a API usa um fallback de desenvolvimento. `AUTH_SECRET` é **obrigatório**: o Next-Auth v5 recusa iniciar sem ele. Gere e substitua o valor vazio em `apps/web/.env.local`:

```bash
openssl rand -base64 32   # cole o resultado em AUTH_SECRET=<valor>
```

### 2. Banco de dados

```bash
docker compose up db -d
```

### 3. API (porta 8000) — novo terminal

```bash
cd apps/api
uv run --env-file .env uvicorn travelmanager.main:app --reload
```

> **Código OTP em dev:** sem `RESEND_API_KEY` configurada, o código de 6 dígitos é impresso no log da API em vez de enviado por e-mail. Procure a linha `OTP dev para <email>: <código>` no terminal da API após solicitar o código na tela de login.

### 4. Web — novo terminal

```bash
pnpm --filter @travelmanager/web dev
```

Abra a URL impressa no terminal (por padrão `http://localhost:3000`; se a porta estiver ocupada o Next.js escolhe a próxima disponível). A jornada completa: landing → `/entrar` → onboarding → painel → criar viagem → painel da viagem com pesquisas de translado.

### Tudo via Docker (alternativa)

```bash
docker compose up --build
```

## Qualidade

O gate real é o workflow `pr-checks` (web: biome + typecheck + vitest; api: ruff +
pyright + pytest; gitleaks). Rode localmente antes de subir:

```bash
node_modules/.bin/biome check apps/web
pnpm --filter @travelmanager/web typecheck
pnpm --filter @travelmanager/web test
cd apps/api && uv run ruff format --check . && uv run ruff check . && uv run pyright && uv run pytest -m "not integration"
```
