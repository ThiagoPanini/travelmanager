# ADR 0005 — Substrato de planejamento: GitHub Issues (Matt Pocock), divergindo do epistemix

- **Status:** Accepted
- **Data:** 2026-06-08
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** epistemix [ADR-0014](../../../epistemix/docs/adr/0014-roadmap-como-source-skill-solo-dev-assistant.md), [ADR-0017 §5-6](../../../epistemix/docs/adr/0017-desenvolvimento-autonomo-afk.md) · [ADR-0001](0001-stack-e-arquitetura-espelha-epistemix.md)

## Contexto

O `traveltogether` espelha o epistemix, cujo ADR-0017 (§5-6) escolhe `docs/specs/NNNN-<feature>.md` como substrato de planejamento — versionado, in-repo, cross-harness — e **defere GitHub Issues**, tratando as skills `to-prd`/`to-issues` como "não-wired" até serem adaptadas para escrever em `docs/specs/`. A razão lá: o operador "dificilmente cria issue manual" e quer specs portáveis entre harnesses.

A **filosofia original de Matt Pocock** (de onde essas skills vêm) é o oposto: o substrato é o **issue tracker**, com vertical slices publicadas como issues independentes e grabáveis por agentes, marcadas com label `ready-for-agent`.

## Decisão

Para o `traveltogether`, **usar GitHub Issues como substrato de planejamento, no estilo Matt Pocock**:

- Cada vertical slice (tracer bullet) é uma **issue independente** com critério de aceite e `Blocked by`.
- Slices prontas para execução autônoma levam a label **`ready-for-agent`**; slices que param nas bordas levam **`hitl`**.
- Labels organizacionais espelham o epistemix: `phase-1`, áreas (`infra`, `ci`, `web`, `api`) e boundaries (`identity`, `trips`, `fares`, `shared`, `platform`).
- A classificação AFK/HITL segue o **semáforo do epistemix ADR-0017 §1** (reversibilidade × blast radius), não muda.

## Justificativa

- **Aderência explícita à filosofia Matt Pocock** (pedido do operador) e **caminho mais fácil pro MVP**: o loop AFK (grab → worktree → PR) é nativo do tracker, sem precisar adaptar as skills.
- A **divergência do epistemix fica registrada aqui** — não é inconsistência silenciosa; é uma escolha de projeto.

## Consequências

- Specs não ficam versionadas in-repo nem portáveis cross-harness. **Trade-off aceito:** o contexto durável (linguagem, decisões) vive em [CONTEXT.md](../CONTEXT.md) + ADRs; as issues carregam só o *o-que-construir* + critério de aceite.
- Se o projeto adotar múltiplos harnesses e a portabilidade doer, reabrir — o caminho de volta é o `docs/specs/` do epistemix.
