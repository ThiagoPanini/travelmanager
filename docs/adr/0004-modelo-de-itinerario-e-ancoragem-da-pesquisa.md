# ADR 0004 — Modelo de itinerário e ancoragem da Pesquisa de Passagem

- **Status:** Accepted
- **Data:** 2026-06-08
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** [docs/CONTEXT.md](../CONTEXT.md) (boundaries `trips`, `fares`)

## Contexto

Uma `Viagem` pode ter múltiplos trechos (ex.: SP → 5 dias em NY → 2 dias em Miami → Orlando → volta a SP). Dois conceitos distintos emergem, **cada um hospedando uma feature própria**: o *salto* entre cidades hospeda a `Pesquisa de Passagem` (MVP); a *estadia* numa cidade hospedará o `Roteiro` (futuro). Isso é o sinal mais forte de que são entidades separadas.

## Decisão

- A `Viagem` carrega a **`Origem`** (casa) como campo próprio.
- O itinerário é um caminho: **`Parada` = nó** (cidade + datas de estadia), **`Trajeto` = aresta** (salto conceitual cidade→cidade). `Trajeto.origem` e `Trajeto.destino` referenciam uma `Parada` da mesma Viagem **ou** `null` (= `Origem`), de modo que o primeiro trajeto sai de casa e o último volta, sem caso especial. Os `Trajeto`s são derivados automaticamente da sequência ordenada de `Parada`s.
- **Granularidade:** `Trajeto` é cidade→cidade (unidade de comparação); `Origem` e `Parada`s têm um `Aeroporto de Referência` para leitura visual da rota, enquanto o **aeroporto efetivamente pesquisado** (JFK vs EWR), companhia, valor etc. vive na `Pesquisa de Passagem`.
- A `Pesquisa de Passagem` ancora em **exatamente um** `Trajeto` (FK única).
- **`Parada` é persistida já no MVP** (mesmo sem `Roteiro`), para ancorar a estadia e reservar o lugar do `Roteiro`.

## Justificativa

- Modelo nó/aresta captura a jornada como sequência, com fonte única de verdade para "lugar" (na `Parada`).
- Ancorar a `Pesquisa` na cidade→cidade (e não no aeroporto) casa com o fluxo real: A achou `GRU→JFK`, B achou `GRU→EWR` — mesma comparação de "ir pra Nova York".

## Consequências / Evolução

- **Ida-e-volta / multi-trecho:** o modelo nó/aresta **já** representa ida e volta como dois `Trajeto`s. Quando uma tarifa precisar cobrir vários `Trajeto`s (passagem ida-e-volta), a `Pesquisa` passa de FK única para uma **tabela de ligação `pesquisa_trajeto`** — migração **aditiva** (cada Pesquisa vira grupo-de-um), sem retrabalho em `Trajeto`/`Parada`/`Viagem`. Disparar quando viagens de trajeto único com ida-e-volta virarem prioridade.
- **Ciclo de vida:** apagar ou reordenar uma `Parada` que afetaria um `Trajeto` com `Pesquisa`s é bloqueado no MVP.

## Opções rejeitadas

- **Trajeto independente (sem FK pra Parada):** evita acoplamento de ciclo de vida, mas duplica "lugar" e deixa os dois divergirem.
- **Deferir `Parada` (só glossário):** schema mais enxuto no MVP, preterido porque o usuário quis estrutura explícita desde já.
- **Pesquisa cobrindo vários Trajetos desde o MVP:** preterida por YAGNI; é a evolução documentada acima.
