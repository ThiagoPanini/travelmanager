# Contexto de Domínio — traveltogether

Este documento é o **glossário e conjunto de invariantes** que define a linguagem comum do projeto. É lido por humanos e por agentes de IA antes de qualquer trabalho substantivo. Mudanças aqui são mudanças no jeito de pensar o produto.

> **Status:** criado na sessão `grill-with-docs` de inicialização (2026-06-08). Mudanças futuras passam por ADR + atualização inline. Decisões arquiteturais em [docs/adr/](adr/README.md); direção visual em [DESIGN.md](../DESIGN.md).

## Convenção de nomes

O **termo canônico do glossário é em pt-BR** (o domínio é naturalmente pt-BR e é como o produto é pensado). Os **identificadores de código são em inglês** (entre parênteses no glossário), consistente com o epistemix. Copy de UI é pt-BR.

## Glossário

| Termo (código) | Definição operacional |
|---|---|
| **Viagem** (`Trip`) | Jornada planejada por um grupo, criada por um `Usuário`. Tem nome, descrição, uma `Origem` (casa), um `Período da Viagem` e uma sequência ordenada de `Parada`s. É a unidade de topo de organização **e** de permissão (papéis são por-Viagem). |
| **Período da Viagem** (`TripDateRange`) | Intervalo planejado da `Viagem`, composto por `data de ida` e `data de volta`. É informado na criação da `Viagem` e define os limites temporais do itinerário. |
| **Origem** (`origin`) | Cidade de casa de onde a `Viagem` parte e para onde retorna, sempre associada a um `Aeroporto de Referência`. É um **campo da Viagem**, não uma `Parada`. Faz o bookend dos `Trajeto`s: o primeiro sai da Origem, o último volta a ela. |
| **Parada** (`Stop`) | Cidade onde o grupo permanece, com datas de chegada e partida (a "estadia") e um `Aeroporto de Referência`. **Nó** ordenado do itinerário. Pertence a uma `Viagem`. Hospeda o `Roteiro`. |
| **Trajeto** (`Leg`) | O salto conceitual cidade→cidade entre dois lugares consecutivos da sequência `Origem` → `Parada`s → `Origem`. **Aresta** derivada do itinerário. Origem e destino referenciam uma `Parada` da mesma Viagem **ou** `null` (= `Origem` da Viagem). Unidade onde `Pesquisa de Passagem`s são comparadas. |
| **Aeroporto de Referência** (`ReferenceAirport`) | Aeroporto principal escolhido para representar visualmente uma `Origem` ou `Parada` no planejamento. Não impede que uma `Pesquisa de Passagem` registre aeroportos efetivamente pesquisados diferentes. |
| **Pesquisa de Passagem** (`FareQuote`) | Registro de uma tarifa de voo que um organizador encontrou e cadastrou para **um** `Trajeto`. Carrega: `valor` + `moeda`, `data` do voo, `duração_total`, `escalas` (direto/nº), `bagagem_despachada`, `aeroporto_origem`/`aeroporto_destino`, `companhia`, `link`, `observações`, autor (`registrado_por`) e `criado_em`. Várias por `Trajeto`. |
| **Escolhida** (`chosen`) | Marcação persistida que um organizador aplica a no máximo **uma** `Pesquisa de Passagem` por `Trajeto`, indicando a opção decidida pelo grupo. Sinal explícito de convergência. |
| **Upvote** (`Vote`) | Voto positivo persistido de um `Usuário` da Viagem numa `Pesquisa de Passagem`. Toggle (votar/desfazer). Único por par (`Usuário`, `Pesquisa`). Sinal social/orgânico que informa a `Escolhida`. |
| **Organizador** (`Organizer`) | Papel de um `Usuário` dentro de uma `Viagem` com poder de **escrita**: gerir metadados, `Parada`s, `Trajeto`s, membros (adicionar/remover, promover/rebaixar), registrar `Pesquisa de Passagem`s e marcar a `Escolhida`. O criador da Viagem é o primeiro organizador. |
| **Membro** (`Member`) | Papel de um `Usuário` dentro de uma `Viagem` com acesso de **leitura + Upvote**. Não registra itens via formulário. Dormente no MVP (onde todos viram organizadores); existe para a fase aberta. |
| **Convite** (`Invitation`) | Intenção, criada por um `Organizador`, de incluir um e-mail numa `Viagem`. Tem estado `pendente`/`aceito`/`recusado`. **Não é uma `Membership`**: gera uma `Notificação` ao convidado e só vira `Membership` (papel `Membro`) quando ele **aceita**; recusar descarta. Se o convidado ainda não tem conta, o `Convite` aguarda o cadastro para então ser apresentado. Substitui a resolução silenciosa via JIT do MVP. |
| **Usuário** (`User`) | Pessoa autenticada na plataforma, com **conta própria** criada por ela (cadastro por Google ou por e-mail com código de acesso). Tem `nome de exibição`, `avatar` e `Preferências de Notificação`, e é identificada unicamente por e-mail. Participa de várias `Viagem`s, com papéis distintos em cada. O acesso à **plataforma** é aberto; o acesso a uma **`Viagem`** é dado por `Membership`. |
| **Preferências de Notificação** (`NotificationPrefs`) | Ajustes do `Usuário` que governam a entrega de `Notificação`s: interruptor por tipo (`decision`/`task`/`mention`) e opt-in de **resumo por e-mail** (`digest`). Pertencem ao perfil do `Usuário`, não a uma `Viagem`. |
| **Roteiro** (`Itinerary`) | Plano compartilhado do que o grupo pretende fazer durante uma `Parada` ("o que fazer nos 5 dias em NY"). Pertence a exatamente uma `Parada` e organiza os planos daquela estadia. |
| **Item de Roteiro** (`ItineraryItem`) | Registro individual dentro de um `Roteiro`, representando uma atividade, lugar, reserva, link ou observação planejada para a `Parada`. Tem título e pode ter notas, link, dia/horário e ordem dentro da estadia. |
| **Imagem de Capa** (`CoverImage`) | Imagem visual que representa uma `Viagem` ou uma `Parada` na interface. Não muda o significado da viagem nem da parada; é um recurso editorial para reconhecimento e contexto visual. |
| **Comentário** (`Comment`) | Mensagem de **texto** que um `Usuário` com `Membership` (qualquer papel) escreve para discutir, de forma **assíncrona**, dentro de uma `Viagem`. Mira polimorficamente **um** alvo: uma `Pesquisa de Passagem`, um `Item de Roteiro` ou a própria `Viagem` (alvo Viagem = **mural** geral do grupo). É o **primeiro write disponível a um `Membro`**. Não é um sinal de decisão — `Upvote`/`Escolhida` continuam separados. |
| **Tarefa** (`Task`) | Unidade de trabalho que um `Organizador` cria e atribui a um ou mais `Responsável`(eis) dentro de uma `Viagem`, para coordenar o que o grupo precisa fazer (ex.: "pesquisar passagem deste `Trajeto`", "reservar hotel"). Tem `título`, descrição e prazo opcionais, `status` (`a fazer`/`fazendo`/`feito`) e uma **âncora opcional** a um alvo (`Trajeto`, `Parada`, `Pesquisa de Passagem` ou `Item de Roteiro`). Visualizada como board. Várias por `Viagem`. |
| **Responsável** (`assignee`) | `Usuário` com `Membership` na `Viagem` designado a uma `Tarefa`. Uma `Tarefa` pode ter vários. Pode mover o `status` da `Tarefa` em que está designado — mesmo sendo `Membro`. |
| **Orçamento** (`Budget`) | Estimativa de custo de uma `Viagem`, **agregada** a partir de três fontes: as `Pesquisa de Passagem`s `Escolhida`s (passagens), as `Hospedagem`s e os `Extra`s. Não é uma entidade própria com valor único: é uma **visão somada por moeda** (ver invariante 15 — sem conversão de câmbio). Apresenta subtotais por pessoa e por grupo, **dentro de cada moeda**. |
| **Hospedagem** (`Lodging`) | Linha de custo estimado de estadia, ancorada a uma `Parada`. Carrega `descrição`, `valor por noite` + `moeda`, e uma `base de rateio`. As noites são derivadas das datas da `Parada`. Compõe o `Orçamento`. |
| **Extra** (`Extra`) | Linha de custo avulsa do `Orçamento`, no nível da `Viagem` (seguro, transporte, passeios…). Carrega `descrição`, `valor` + `moeda` e uma `base de rateio`. Não é ancorada a `Parada` nem a `Trajeto`. |
| **Base de rateio** (`basis`) | Como uma linha de `Hospedagem`/`Extra` se distribui entre o grupo: **por pessoa** (o valor já é por cabeça) ou **rateado** (o valor é do grupo e se divide pelo nº de `Membership`s). Determina como a linha entra no subtotal por pessoa. |
| **Notificação** (`Notification`) | Aviso **direcionado a um `Usuário` específico** sobre algo que pede sua atenção numa `Viagem`: ser adicionado (`invite`), uma `Escolhida` marcada num `Trajeto` de uma `Viagem` sua (`decision`), ser designado `Responsável` de uma `Tarefa` (`task`), ou ser mencionado num `Comentário` (`mention`). Persistida **por destinatário**, com estado **lida/não-lida**. Difere da `Atividade` (feed factual e público, sem destinatário nem estado de leitura). Não é sinal de decisão. |
| **Atividade** (`Activity`) | Feed cronológico **derivado** (não persistido) do que aconteceu nas `Viagem`s de um `Usuário` — ex.: alguém entrou, registrou `Pesquisa de Passagem`, comentou. Público para os membros, **sem** destinatário nem estado de leitura. Não confundir com `Notificação`. |

## Invariantes de domínio

> Regras que SEMPRE valem. Qualquer código que possa violá-las é bug.

1. Toda `Viagem` tem ≥1 `Organizador`; não é possível rebaixar nem remover o último organizador.
2. O criador de uma `Viagem` é organizador dessa Viagem.
3. Toda `Origem` e toda `Parada` têm um `Aeroporto de Referência`.
4. Toda `Viagem` tem `data de ida` e `data de volta`, com volta igual ou posterior à ida.
5. Uma `Viagem` pode existir sem `Parada`s; quando houver `Parada`s, a primeira começa na `data de ida` da `Viagem` e a última termina na `data de volta` da `Viagem`.
6. Datas de `Parada`s devem ficar dentro do `Período da Viagem`, e a saída de uma `Parada` não pode ser anterior à sua chegada.
7. O sistema pode sugerir datas iniciais para novas `Parada`s, mas não redistribui automaticamente dias entre cidades.
8. Os `Trajeto`s de uma `Viagem` são derivados da ordem das `Parada`s entre a saída da `Origem` e o retorno à `Origem`.
9. Não se remove nem reordena uma `Parada` quando isso afetaria um `Trajeto` que já tem `Pesquisa de Passagem` ancorada (MVP).
10. Uma `Pesquisa de Passagem` pertence a **exatamente um** `Trajeto` (MVP). *(Evolução documentada em "Decisões abertas": poderá cobrir vários Trajetos. Ver [ADR-0004](adr/0004-modelo-de-itinerario-e-ancoragem-da-pesquisa.md).)*
11. No máximo **uma** `Pesquisa de Passagem` por `Trajeto` está marcada como `Escolhida`.
12. Um `Upvote` é único por par (`Usuário`, `Pesquisa de Passagem`).
13. Só `Organizador`es registram/editam `Parada`s, `Item de Roteiro`s e `Pesquisa de Passagem`s via formulário; `Membro`s têm leitura + `Upvote` + `Comentário`.
14. Um `Organizador` pode editar/apagar **qualquer** `Pesquisa de Passagem` da Viagem; a autoria (`registrado_por`) é preservada para histórico.
15. `moeda` é registrada por linha de custo (`Pesquisa de Passagem`, `Hospedagem`, `Extra`); **não há conversão de câmbio** em lugar nenhum — nem na comparação de `Pesquisa de Passagem` (que é visual), nem no `Orçamento` (que **soma por moeda**, apresentando subtotais separados por moeda). Não há moeda-base do sistema.
16. Acesso à **plataforma** é aberto: qualquer pessoa cria a própria conta (Google ou e-mail com código). Acesso a uma **`Viagem`** exige `Membership` nela — sem membership, a `Viagem` é invisível para o `Usuário`. *(Supersede o gate por allowlist do [ADR-0003](adr/0003-modelo-de-acesso-mvp.md); novo ADR a registrar.)*
17. Qualquer `Usuário` com `Membership` numa `Viagem` pode escrever `Comentário`s nela. O autor edita/apaga os próprios; um `Organizador` pode apagar qualquer `Comentário` da Viagem (moderação). Um `Comentário` não altera a estrutura do itinerário nem sinais de decisão.
18. Só `Organizador`es criam, atribuem, editam e apagam `Tarefa`s; qualquer `Responsável` (mesmo `Membro`) pode mover o `status` da `Tarefa` em que está designado. Todo `Responsável` precisa ter `Membership` na `Viagem`.
19. Só `Organizador`es registram/editam/apagam linhas de `Orçamento` (`Hospedagem`, `Extra`), consistente com a invariante 13. O subtotal **por pessoa** divide as linhas `rateado` pelo nº de `Membership`s da `Viagem`; o subtotal nunca cruza moedas (invariante 15).
20. Uma `Notificação` é **por destinatário** e seu estado lida/não-lida é por destinatário. Marcar como lida não altera nada no domínio que a originou (não é sinal de decisão). Só o próprio destinatário lê e marca suas `Notificação`s.
21. Adicionar um e-mail a uma `Viagem` cria um `Convite` `pendente`, **não** uma `Membership`. A `Membership` (papel `Membro`) só passa a existir quando o convidado **aceita** o `Convite`. Ninguém entra numa `Viagem` sem aceite explícito.

## Boundaries de domínio

Cada boundary é dono dos seus modelos, regras e dados. Comunicação entre boundaries é via interface explícita, nunca import direto de modelos.

- **`identity`** — `Usuário`, autenticação (Google OAuth + e-mail com código), conta/perfil, sessão. Delegado a provedor externo; expõe `CurrentUser` aos outros boundaries.
- **`trips`** — `Viagem`, `Parada`, `Trajeto`, `Roteiro`, `Membership` (papéis `Organizador`/`Membro` por Viagem), gestão de membros. Estrutura do itinerário.
- **`fares`** — `Pesquisa de Passagem`, `Upvote`, `Escolhida`. A feature de comparação/convergência de passagens. Referencia `Trajeto` por `LegId`.
- **`collaboration`** — `Comentário` e `Tarefa`: primitivos de coordenação do grupo, ancorados polimorficamente a alvos de outros boundaries (referencia `Pesquisa de Passagem`, `Item de Roteiro`, `Trajeto`, `Parada` ou `Viagem` por id), nunca importando seus modelos.
- **`budget`** — `Hospedagem` e `Extra`: linhas de custo estimado. Agrega o `Orçamento` lendo as `Pesquisa de Passagem`s `Escolhida`s (via service de `fares`) e as `Parada`s/`Membership`s (via service de `trips`), nunca importando seus modelos. Não converte câmbio (invariante 15).
- **`notifications`** — `Notificação`: avisos persistidos por destinatário, com estado lida/não-lida. Os boundaries que originam o evento (`trips`, `fares`, `collaboration`) **chamam o service de `notifications` diretamente** ao produzir o aviso — não há barramento de eventos; segue o padrão "um boundary chama o service de outro". A `Atividade` (feed derivado) permanece em `trips`.
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
| "Sigla" / "código visual" | `Aeroporto de Referência` ou aeroporto registrado na `Pesquisa de Passagem` |
| "Plano" / "Programação" (soltos) | `Roteiro` ou `Item de Roteiro` |
| "Foto do destino" | `Imagem de Capa` da `Viagem` ou `Imagem de Capa` da `Parada` |
| "Convidado" | `Usuário` com `Convite` pendente (antes do aceite) ou `Membro` (depois) |
| "Chat" / "Mensagem" / "Post" / "Discussão" (entidade) | `Comentário` |
| "Reação" / "Emoji" (em item) | `Upvote` (na `Pesquisa`) ou `Comentário` (texto) |
| "To-do" / "Card" / "Ticket" / "Atribuição" | `Tarefa` |
| "Atribuído" / "Dono da tarefa" | `Responsável` |
| "Admin" (no nível da Viagem) | `Organizador` |
| "Custo" / "Despesa" / "Gasto" (entidade) | `Hospedagem`, `Extra` ou o `Orçamento` (a visão somada) |
| "Conversão" / "câmbio" / "em reais" (no orçamento) | subtotal **por moeda** (não há conversão — invariante 15) |
| "Alerta" / "Aviso" / "Aviso push" / "Feed" | `Notificação` (direcionada) ou `Atividade` (feed derivado) |
| "Preferência de assento/voo" como entidade | campo de perfil do `Usuário` (não é domínio de `Viagem`) |

## Decisões abertas

- **Ida-e-volta / multi-trecho:** `Pesquisa de Passagem` poderá cobrir vários `Trajeto`s (passa de FK única para tabela de ligação `pesquisa_trajeto`; backfill como grupo-de-um). Migração aditiva. Disparar quando viagens de trajeto único com ida-e-volta virarem prioridade.
- **Eleição coletiva formal:** hoje a convergência é `Upvote` (orgânico) + `Escolhida` (organizador). Votação estruturada pode ser reconsiderada quando o padrão de uso pedir.
- **Detalhes comerciais de Item de Roteiro:** ingressos, valores, fornecedores e decisões de compra podem virar campos ou subentidades quando atividades pagas/reserváveis forem prioridade. No MVP ficam em notas/link.
