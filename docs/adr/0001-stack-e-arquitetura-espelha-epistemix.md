# ADR 0001 — Stack e arquitetura: espelhar o epistemix

- **Status:** Accepted
- **Data:** 2026-06-08
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** epistemix [ADR-0001](../../../epistemix/docs/adr/0001-monorepo-and-boundaries.md), [ADR-0002](../../../epistemix/docs/adr/0002-stack-fastapi-nextjs-postgres.md), [ADR-0004](../../../epistemix/docs/adr/0004-hexagonal-pragmatica.md) · [ADR-0002](0002-infra-panini-vps.md)

## Contexto

`traveltogether` é um produto novo. O MVP é um **CRUD colaborativo relacional** (Viagem, Parada, Trajeto, Pesquisa de Passagem, Upvote) para um grupo fechado de amigos, com horizonte de virar SaaS aberto. Não há nada AI-heavy declarado. O epistemix já estabeleceu uma stack madura, com agents/skills/MCPs/ops afinados.

## Decisão

**Espelhar o layout e a stack do epistemix:** monorepo com `apps/web` (Next.js 15, App Router, TS, Tailwind 4, shadcn/ui), `apps/api` (FastAPI, SQLAlchemy/SQLModel, Alembic, `uv`, `ruff`, `pyright`, pytest) e `packages/types` (tipos gerados via OpenAPI). PostgreSQL 17. Arquitetura **hexagonal pragmática** por boundary (`identity`, `trips`, `fares`, `shared`, `platform`), com granularidade proporcional à complexidade — exatamente as regras anti-overengineering do epistemix ADR-0004.

## Justificativa

- **Consistência de portfólio:** reuso direto de tooling, padrões, skills e ops já afinados para o monorepo Next.js + FastAPI.
- **Runway pra fase aberta:** boundaries desacoplados e contrato OpenAPI facilitam a evolução pra multi-tenant.
- **Trade-off reconhecido explicitamente:** no epistemix o FastAPI separado se justifica pelo ecossistema Python da Fase 4 (voz, RAG, embeddings). Aqui ele se justifica por **consistência**, não por necessidade de IA. É uma *consistency tax* escolhida conscientemente; se um dia uma feature avançada for genuinamente AI-heavy, ela retro-justifica a camada.

## Consequências

- **Positivas:** zero curva de aprendizado de stack; refactors cross-stack triviais; mesmo banco cobre MVP → fase aberta.
- **Negativas:** dois runtimes e mais cerimônia do que um Next.js full-stack exigiria para um CRUD. Aceito em troca de consistência.

## Opções rejeitadas

- **Next.js full-stack (sem FastAPI):** caminho mais rápido pro MVP, mas quebra a consistência com o epistemix e o conforto operacional do autor.
- **Next.js full-stack com costura pra extrair API depois:** meio-termo válido, preterido pela mesma razão de consistência.
