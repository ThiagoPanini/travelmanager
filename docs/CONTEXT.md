# Contexto de Domínio — traveltogether

Este documento é o **glossário e conjunto de invariantes** que define a linguagem comum do projeto. É lido por humanos e por agentes de IA antes de qualquer trabalho substantivo. Mudanças aqui são mudanças no jeito de pensar o produto.

> **Status:** criado na sessão `grill-with-docs` de inicialização (2026-06-08). Mudanças futuras passam por ADR + atualização inline. Decisões arquiteturais em [docs/adr/](adr/README.md); direção visual em [DESIGN.md](../DESIGN.md).

## Convenção de nomes

O **termo canônico do glossário é em pt-BR** (o domínio é naturalmente pt-BR e é como o produto é pensado). Os **identificadores de código são em inglês** (entre parênteses no glossário), consistente com o epistemix. Copy de UI é pt-BR.

## Glossário

| Termo (código) | Definição operacional |
|---|---|
| **Viagem** (`Trip`) | Jornada planejada por um grupo, criada por um `Usuário`. Tem nome, descrição, uma `Origem` (casa) e conjuntos ordenados de `Parada`s e `Trajeto`s. É a unidade de topo de organização **e** de permissão (papéis são por-Viagem). |
| **Origem** (`origin`) | Cidade/aeroporto de casa de onde a `Viagem` parte e para onde retorna. É um **campo da Viagem**, não uma `Parada`. Faz o bookend dos `Trajeto`s: o primeiro sai da Origem, o último volta a ela. |
| **Parada** (`Stop`) | Cidade onde o grupo permanece, com datas de chegada e partida (a "estadia"). **Nó** ordenado do itinerário. Pertence a uma `Viagem`. Hospedará o `Roteiro` (futuro). |
| **Trajeto** (`Leg`) | O salto conceitual cidade→cidade entre dois lugares consecutivos. **Aresta** ordenada do itinerário. Origem e destino referenciam uma `Parada` da mesma Viagem **ou** `null` (= `Origem` da Viagem). Unidade onde `Pesquisa de Passagem`s são comparadas. |
| **Pesquisa de Passagem** (`FareQuote`) | Registro de uma tarifa de voo que um organizador encontrou e cadastrou para **um** `Trajeto`. Carrega: `valor` + `moeda`, `data` do voo, `duração_total`, `escalas` (direto/nº), `bagagem_despachada`, `aeroporto_origem`/`aeroporto_destino`, `companhia`, `link`, `observações`, autor (`registrado_por`) e `criado_em`. Várias por `Trajeto`. |
| **Escolhida** (`chosen`) | Marcação que um organizador aplica a no máximo **uma** `Pesquisa de Passagem` por `Trajeto`, indicando a opção decidida pelo grupo. Sinal explícito de convergência. |
| **Upvote** (`Vote`) | Voto positivo de um `Usuário` da Viagem numa `Pesquisa de Passagem`. Toggle (votar/desfazer). Único por par (`Usuário`, `Pesquisa`). Sinal social/orgânico que informa a `Escolhida`. |
| **Organizador** (`Organizer`) | Papel de um `Usuário` dentro de uma `Viagem` com poder de **escrita**: gerir metadados, `Parada`s, `Trajeto`s, membros (adicionar/remover, promover/rebaixar), registrar `Pesquisa de Passagem`s e marcar a `Escolhida`. O criador da Viagem é o primeiro organizador. |
| **Membro** (`Member`) | Papel de um `Usuário` dentro de uma `Viagem` com acesso de **leitura + Upvote**. Não registra itens via formulário. Dormente no MVP (onde todos viram organizadores); existe para a fase aberta. |
| **Usuário** (`User`) | Pessoa autenticada na plataforma, identificada por e-mail. No MVP só entra se o e-mail estiver na **allowlist**. Participa de várias `Viagem`s, com papéis distintos em cada. |
| **Roteiro** (`Itinerary`) *(futuro)* | Conjunto de atividades/planos atrelados a uma `Parada` ("o que fazer nos 5 dias em NY"). Fora do escopo do MVP; a `Parada` já existe para ancorá-lo. |

## Invariantes de domínio

> Regras que SEMPRE valem. Qualquer código que possa violá-las é bug.

1. Toda `Viagem` tem ≥1 `Organizador`; não é possível rebaixar nem remover o último organizador.
2. O criador de uma `Viagem` é organizador dessa Viagem.
3. Um `Trajeto` referencia, como origem e como destino, uma `Parada` da mesma `Viagem` **ou** `null` (= `Origem` da Viagem).
4. Uma `Pesquisa de Passagem` pertence a **exatamente um** `Trajeto` (MVP). *(Evolução documentada em "Decisões abertas": poderá cobrir vários Trajetos. Ver [ADR-0004](adr/0004-modelo-de-itinerario-e-ancoragem-da-pesquisa.md).)*
5. No máximo **uma** `Pesquisa de Passagem` por `Trajeto` está marcada como `Escolhida`.
6. Um `Upvote` é único por par (`Usuário`, `Pesquisa de Passagem`).
7. Só `Organizador`es registram/editam itens via formulário; `Membro`s têm leitura + `Upvote`.
8. Um `Organizador` pode editar/apagar **qualquer** `Pesquisa de Passagem` da Viagem; a autoria (`registrado_por`) é preservada para histórico.
9. `moeda` é registrada por `Pesquisa de Passagem`; **não há conversão de câmbio** — comparação é visual.
10. Acesso à plataforma exige e-mail na **allowlist** (MVP). Ver [ADR-0003](adr/0003-modelo-de-acesso-mvp.md).

## Boundaries de domínio

Cada boundary é dono dos seus modelos, regras e dados. Comunicação entre boundaries é via interface explícita, nunca import direto de modelos.

- **`identity`** — `Usuário`, autenticação, allowlist, sessão. Delegado a provedor externo; expõe `CurrentUser` aos outros boundaries.
- **`trips`** — `Viagem`, `Parada`, `Trajeto`, `Membership` (papéis `Organizador`/`Membro` por Viagem), gestão de membros. Estrutura do itinerário. Hospedará o `Roteiro` (futuro).
- **`fares`** — `Pesquisa de Passagem`, `Upvote`, `Escolhida`. A feature de comparação/convergência de passagens. Referencia `Trajeto` por `LegId`.
- **`shared`** — value objects e tipos base (ex.: `UserId`, `TripId`, `LegId`, `Money`, `AirportCode`, `DateRange`).
- **`platform`** — adapters de DB, observabilidade, e-mail/auth.

## Termos ambíguos a evitar

| Não use | Use |
|---|---|
| "Voo" (como entidade) | `Trajeto` (o salto) ou `Pesquisa de Passagem` (a tarifa) |
| "Proposta" / "Opção" / "Cotação" | `Pesquisa de Passagem` |
| "Etapa" / "Perna" / "Segmento" | `Trajeto` |
| "Like" / "Curtida" / "Coração" | `Upvote` |
| "Destino" (solto) | `Parada` (cidade do itinerário) ou `Origem` (casa) |
| "Convidado" | `Membro` (papel) ou `Usuário` |
| "Admin" (no nível da Viagem) | `Organizador` |

## Decisões abertas

- **Ida-e-volta / multi-trecho:** `Pesquisa de Passagem` poderá cobrir vários `Trajeto`s (passa de FK única para tabela de ligação `pesquisa_trajeto`; backfill como grupo-de-um). Migração aditiva. Disparar quando viagens de trajeto único com ida-e-volta virarem prioridade.
- **Roteiro:** atividades por `Parada` — fase futura. A `Parada` já é persistida no MVP para ancorá-lo.
- **Eleição coletiva formal:** hoje a convergência é `Upvote` (orgânico) + `Escolhida` (organizador). Votação estruturada pode ser reconsiderada quando o padrão de uso pedir.
