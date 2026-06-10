# Design — traveltogether

> **Status:** direção visual ativa após handoff de Claude Design (2026-06-09). A direção escolhida para implementação é **Direção B — Cartão de Embarque**.

## Direção

**Cartão de Embarque**: uma aplicação dark-first que parece um hub de viagem de grupo, não um SaaS genérico. A metáfora visual é o bilhete perfurado: `Viagem`s viram cartões de embarque, `Trajeto`s viram ticket rows e `Pesquisa de Passagem`s viram bilhetes comparáveis.

- **Base:** quase-preto, superfícies grafite, bordas discretas e contraste WCAG AA.
- **Acento:** coral/vermelho-mapa (`#e0556b`) com variações suaves para hover, linhas e destaques.
- **Tipografia:** Inter para UI e títulos; JetBrains Mono para códigos, datas, preços e dados de viagem.
- **Motivo visual:** perfuração tracejada, stubs de bilhete, códigos de rota e capas pequenas de destino com overlay escuro.

## Aplicação por área

- **Home pública:** apresentação do projeto inspirada no hub do handoff, com rota pontilhada, passos de planejamento e cards informativos com hover.
- **Login:** check-in privado. Copy deixa claro o contexto privado e o acesso por e-mail autorizado.
- **Lista de Viagens:** cartões de embarque com Origem, código visual e papel `Organizador`/`Membro`.
- **Detalhe da Viagem:** hero de itinerário com Origem + sequência de `Parada`s + retorno. A tela principal é uma sequência narrativa de `Parada`s; `Trajeto`s aparecem como conectores/ticket rows entre elas, onde vivem as `Pesquisa de Passagem`s.
- **Rotas exibidas:** na lista de `Viagem`s, a rota mostra `Origem` + `Parada`s sem o retorno final; no detalhe da `Viagem`, a rota mostra o ciclo completo com retorno à `Origem`. Todo código de aeroporto aparece acompanhado da cidade em texto menor e sutil.
- **Imagens de Capa:** `Organizador` edita capas por upload local simples. O MVP não tem busca externa nem cropper; a interface usa enquadramento por `object-fit: cover`, overlay escuro e gradiente inferior mais forte para preservar a leitura do texto.
- **Pesquisas de Passagem:** bilhetes com stub de preço e modo de comparação em tabela lado-a-lado.
- **Membros:** copy informal de "Tripulação", mantendo os papéis canônicos `Organizador` e `Membro`.

## Limites de linguagem

- "Cartão de Embarque", "portão", "tripulação" e "embarcar" são **copy/visual**, não termos de domínio.
- O glossário continua mandando: `Viagem`, `Origem`, `Parada`, `Trajeto`, `Pesquisa de Passagem`, `Escolhida`, `Upvote`, `Organizador`, `Membro`, `Usuário`.
- `Roteiro` é parte do MVP e deve aparecer como fluxo real dentro das Paradas, mantendo a linguagem canônica do glossário.

## Princípios

1. A estética serve o conteúdo; dados de voo e decisões de grupo continuam legíveis primeiro.
2. O tema de viagem aparece como craft de interface, não como kitsch.
3. Componentes interativos têm foco visível, estados de hover e contraste dark-first.
4. `prefers-reduced-motion` é respeitado.
