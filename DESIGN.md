# Design — traveltogether

> **Status:** direção visual ativa após segundo handoff de Claude Design (2026-06-11). A direção escolhida para implementação é **Atlas** — papel claro, tinta floresta, laranja queimado. Substitui a direção anterior "Cartão de Embarque" (dark-first, coral), que fica **descontinuada**.

## Direção

**Atlas**: um atlas moderno de viagem em grupo — papel claro com grão sutil, tinta verde-floresta e um laranja queimado como acento. A metáfora não é mais o bilhete perfurado; é a **carta náutica / mapa de rota**: códigos de aeroporto em células split-flap, capas com linhas topográficas, e a rota da `Viagem` desenhada como uma linha de nós (`Origem` → `Parada`s → `Origem`) com setas pontilhadas.

- **Base:** papel claro (`#f4f0e6`), superfícies marfim (`#faf8f1` / `#f1ecdf`), grão de papel fixo e discreto sobre o fundo. Contraste WCAG AA.
- **Tinta:** verde-floresta profundo (`#1f3a2e`) como cor de texto e de elementos sólidos (marca, avatares, botão primário).
- **Acento:** laranja queimado (`#c05621`) para kickers, foco de formulário, hover de rota, `Escolhida` (stamp) e CTAs.
- **Tipografia:** **Archivo** (variável, com eixo de largura `wdth` esticado em ~112% nos displays) para títulos e UI; **IBM Plex Mono** para códigos de aeroporto, datas, preços, kickers e qualquer dado de viagem.
- **Raios:** cantos quase retos (`--radius: 2px`, `--radius-lg: 4px`) — sensação de papel impresso, não de SaaS arredondado.
- **Motivo visual:** células de código split-flap (cada letra do `Aeroporto de Referência` numa caixa), linhas de contorno topográfico nas capas, banda vertical de acento, kickers mono em maiúsculas com tracking largo.

## Aplicação por área

- **Home pública:** hero editorial ("A viagem do grupo, finalmente fora do grupo do zap."), um *board* de rota de exemplo animado e três pilares numerados (Itinerário com `Parada`s · `Pesquisa de Passagem`s · Decisão em grupo). Fecho com nota mono "mvp · acesso por allowlist".
- **Login:** identificação por e-mail ("Identifique-se" / kicker "embarque"). Copy deixa claro o acesso por allowlist no MVP. Sem senha.
- **Lista de Viagens:** cartões largos com capa topográfica à esquerda, nome em display, período em mono, sequência de códigos `Origem → Parada`s, pilha de avatares e papel `Organizador`.
- **Detalhe da Viagem:** header com capa topográfica + `Período da Viagem` em mono; a `RouteLine` mostra o ciclo completo (`Origem` → `Parada`s → `Origem`) com cada `Trajeto` como aresta clicável (mostra nº de `Pesquisa de Passagem`s, melhor preço, ou ✓ `Escolhida`). Abaixo, grade de cards de `Parada`.
- **Rotas exibidas:** na lista de `Viagem`s, a sequência de códigos vai de `Origem` até a última `Parada` e volta à `Origem`; no detalhe, a `RouteLine` desenha o ciclo completo com as arestas (`Trajeto`s) interativas. Todo código de aeroporto aparece com a cidade em texto menor e sutil.
- **Imagens de Capa:** a capa é sempre o grafismo topográfico gerado a partir do id (sem upload). A funcionalidade de upload de `Imagem de Capa` foi **removida da superfície** (UI, actions, endpoints) e está adiada para reavaliação futura — as colunas no banco e o adapter de storage (ADR-0008) permanecem dormentes, sem uso, prontos para uma eventual retomada.
- **Pesquisas de Passagem (`Trajeto`):** *board* de linhas com companhia, duração/escalas/bagagem em mono, observações, preço em mono grande, `Upvote` (pílula) e ação `Escolher`/`Desmarcar` (a `Escolhida` ganha o *stamp* laranja). Modo de comparação em tabela lado a lado, com o melhor valor de cada critério destacado e a nota "sem conversão de câmbio — comparação visual".
- **Membros:** *board* de pessoas com avatar, e-mail em mono, chip de papel (`Organizador` verde / `Membro` outline) e ações Promover/Rebaixar/Remover, respeitando o invariante do último organizador.
- **Roteiro da Parada:** dias numerados (`dia 01`…), itens com horário em mono e acento, notas e link; dia sem itens mostra "Dia livre". Itens sem dia definido vão para uma seção própria.

## Limites de linguagem

- "Embarque", "split-flap", "board" e "atlas" são **copy/visual**, não termos de domínio.
- O glossário continua mandando: `Viagem`, `Origem`, `Parada`, `Trajeto`, `Pesquisa de Passagem`, `Escolhida`, `Upvote`, `Organizador`, `Membro`, `Usuário`, `Roteiro`, `Item de Roteiro`. Ver `docs/CONTEXT.md`.
- A seção "Termos ambíguos a evitar" do CONTEXT.md continua valendo: nunca "voo", "proposta", "etapa", "like".

## Princípios

1. A estética serve o conteúdo; dados de voo e decisões de grupo continuam legíveis primeiro.
2. O tema de viagem aparece como craft de interface (papel, topografia, split-flap), não como kitsch.
3. Componentes interativos têm foco visível (borda laranja), estados de hover e contraste AA.
4. `prefers-reduced-motion` é respeitado (animações de entrada e da rota só rodam quando permitido).
5. Dados de viagem — códigos, datas, preços, moedas — sempre em mono (IBM Plex Mono).
