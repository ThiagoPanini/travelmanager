# ADR 0002 — Infra: deploy no panini-vps (Coolify + Cloudflare)

- **Status:** Accepted
- **Data:** 2026-06-08
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** [ADR-0001](0001-stack-e-arquitetura-espelha-epistemix.md) · epistemix [ADR-0003](../../../epistemix/docs/adr/0003-infra-hostinger-vps-coolify.md), [ADR-0006](../../../epistemix/docs/adr/0006-cloudflare-na-frente-da-vps.md), [ADR-0016](../../../epistemix/docs/adr/0016-vps-agnostica-multi-projeto.md), [lição 0001](../../../epistemix/docs/lessons/0001-hardening-de-vps-linux.md)

## Contexto

A `panini-vps` (Hostinger KVM + Coolify + Traefik + Cloudflare) já existe e é **infra agnóstica multi-projeto** (epistemix ADR-0016). O `traveltogether` deve ser hospedado nela como um novo projeto, reusando todo o hardening e os padrões já documentados.

## Decisão

- **Novo projeto no Coolify** dentro da `panini-vps`, com dois recursos: `apps/web` e `apps/api` (Traefik faz TLS + roteamento).
- **PostgreSQL 17 dedicado ao projeto** (serviço próprio no Coolify, volume e backup independentes) — blast radius isolado do epistemix.
- **Deploy:** GitHub Actions builda imagens (web/api) com **portão de qualidade** (lint + typecheck + test) → push pro GHCR → webhook do Coolify → rolling restart com health checks. Espelha o pipeline do epistemix.
- **Observabilidade mínima (MVP):** Sentry (erros) + logs nativos do Coolify + **backup diário do Postgres → Cloudflare R2**. Logfire/Uptime Kuma/PostHog ficam para quando o produto abrir.
- **Domínio:** subdomínio provisório `traveltogether.thiagopanini.dev`; domínio final a confirmar pelo usuário.
- **Cloudflare** na frente (DNS, proxy/CDN, WAF, esconde IP de origem), como no epistemix.

## Justificativa

- **Reuso total** do hardening, do proxy e do fluxo de deploy já provados.
- **Postgres dedicado** respeita o espírito "VPS agnóstica multi-projeto": ciclos de vida e backups independentes.
- **Portão de qualidade no CI** alinha com "não aliviar decisões técnicas" desde o dia 1, a baixo custo (template já existe).

## Consequências

- VPS única continua sendo SPOF compartilhado entre projetos — aceito enquanto MVP/beta.
- A exceção de hardening para o Coolify (SSH root via `Match Address`, `ignoreip` no fail2ban) **já está resolvida** na VPS; nenhum trabalho novo de hardening é necessário.
- Mudar a allowlist de acesso exige redeploy (ver [ADR-0003](0003-modelo-de-acesso-mvp.md)).
