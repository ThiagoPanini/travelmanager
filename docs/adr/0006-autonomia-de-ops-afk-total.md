# ADR 0006 — Autonomia de ops no traveltogether: AFK total nas bordas 🔴 (DNS + secrets)

- **Status:** Accepted
- **Data:** 2026-06-08
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** **emenda, só para o traveltogether,** ao semáforo do epistemix [ADR-0017 §1](../../../epistemix/docs/adr/0017-desenvolvimento-autonomo-afk.md) · [ADR-0002](0002-infra-panini-vps.md), [ADR-0003](0003-modelo-de-acesso-mvp.md)

## Contexto

O epistemix ADR-0017 §1 classifica **mudança de DNS** e **operações com secrets** como 🔴 ("propõe e para" — o agente prepara e o humano executa). Os MCPs configurados (Cloudflare, Coolify) **conseguem** executar essas operações. Para o `traveltogether` — beta fechado, dados de baixa sensibilidade (preços de passagem) — o operador optou por **autonomia total**, aceitando o trade-off de higiene.

## Decisão

No `traveltogether`, o agente executa **AFK também as bordas 🔴 de ops**, via MCP, registrando tudo em `docs/ai-ops/`:

- **DNS no Cloudflare** — criar/editar o registro do subdomínio apontando pra `panini-vps` (proxy on).
- **Secrets de produção** — gerar e setar env vars secretas (ex.: segredo de assinatura JWT) via Coolify / `gh secret`. Esses valores são **provisórios**; o **operador os rotaciona pós-setup** — é a mitigação que neutraliza a exposição do valor no contexto/transcript do agente.

**Único ponto humano:** a **decisão** do domínio final. Ela **não bloqueia** — usa-se o provisório `traveltogether.thiagopanini.dev` até o operador definir.

## Justificativa

- Velocidade no MVP + autorização explícita do operador.
- A **rotação de secret pós-setup** transforma o risco de higiene num passo trivial e reversível.
- Beta fechado de baixa sensibilidade: o blast radius real de um DNS/secret provisório errado é baixo e auditável.

## Consequências

- Diverge do 🔴 do ADR-0017 **apenas para este projeto**; o epistemix segue inalterado.
- Valores provisórios de secret transitam pelo contexto do agente até a rotação — aceito e mitigado pela rotação.
- Toda mudança de DNS/secret fica auditável em `docs/ai-ops/`.
- **Reabrir** se a sensibilidade dos dados crescer (ex.: dados pessoais, pagamento) ou quando o produto abrir.
