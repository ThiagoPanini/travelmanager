# Design — traveltogether

> **Status:** direção **provisória** definida na sessão `grill-with-docs` de inicialização (2026-06-08). É hipótese de partida para a primeira versão — será refinada numa sessão dedicada de Claude Design. Não é identidade de marca fechada.

## Direção

Mesmo **DNA visual do epistemix**, com **identidade própria pelo acento** e por **detalhes sutis de viagem**:

- **Dark-first**, quase-preto, cinzas mutados. WCAG AA mínimo.
- **Minimalismo com contenção** — "confiança pela contenção e pelo craft, não pelo volume". Gradiente e motion entram só quando agregam, em pontos escolhidos.
- **Tipografia:** Inter (corpo/UI) + **JetBrains Mono** como acento deliberado.
- **Acento de marca:** **azul-céu / cyan** (OKLCH hue ~220) — distinto do violeta do epistemix (hue ~256) e deliberadamente **fugindo do verde**. Evoca céu / altitude / voo.

## Detalhes que caracterizam o tema (sutis, não kitsch)

- **Mono nos dados de viagem:** códigos de aeroporto (`GRU → JFK`), datas (`10 JAN · 9h35`) e preços (`R$ 3.420`) em JetBrains Mono — amarra o visual ao domínio (`Trajeto`, `Pesquisa de Passagem`).
- **Linha de rota tracejada** como motivo de assinatura ligando `Parada`s / pontas de `Trajeto`.
- **Wordmark com gradiente-horizonte** no acento cyan — assinatura em ponto escolhido, não decoração espalhada.
- Densidade tipo "ticket row" para listas de `Pesquisa de Passagem`, com marcadores discretos de `Upvote` (`↑ 4`) e `Escolhida` (`★`).

## Princípios herdados (invariantes)

1. A estética serve o conteúdo; leitura e uso vêm primeiro.
2. Confiança pela contenção — impressionar por precisão, não por volume.
3. `prefers-reduced-motion` honrado; foco visível em tudo interativo.
4. Server rendering por padrão; `color-scheme: dark`; `lang="pt-BR"`.

## Anti-referências

- SaaS genérico (hero-métrica, grids de cards idênticos, copy de buzzword).
- **Kitsch de viagem:** aviõezinhos/malas cartoon, carimbos espalhados, mapas decorativos por toda parte, ilustrações "rabiscadas".
- Glassmorphism decorativo, side-stripes coloridas, eyebrow uppercase em toda seção, cards super-arredondados (>16px).
