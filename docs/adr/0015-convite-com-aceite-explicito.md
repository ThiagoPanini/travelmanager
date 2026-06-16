# ADR 0015 — Convite com aceite explícito (supersede a resolução JIT)

- **Status:** Accepted
- **Data:** 2026-06-15
- **Decisores:** Thiago Panini (solo)
- **Relacionado:** [docs/CONTEXT.md](../CONTEXT.md) (`Convite`, `Membro`, `Notificação`, invariante 21), [ADR-0003](0003-modelo-de-acesso-mvp.md), [ADR-0013](0013-acesso-aberto-contas-proprias.md)

## Contexto

No MVP, adicionar alguém a uma `Viagem` por e-mail criava a `Membership` na hora (pendente), resolvida **silenciosamente** via criação JIT do `Usuário` no primeiro login. Fazia sentido num beta fechado entre amigos: ninguém é adicionado a uma viagem que não espera.

Com a plataforma abrindo (ADR-0013) e o redesenho introduzindo uma tela de **Notificações** com convites a aceitar/recusar, o modelo silencioso vira passivo: qualquer `Organizador` poderia jogar um e-mail qualquer numa `Viagem`, e a pessoa entraria sem consentir — frágil contra spam/abuso quando o cadastro é livre.

## Decisão

- Adicionar um e-mail a uma `Viagem` cria um **`Convite`** com estado `pendente`/`aceito`/`recusado` — **não** uma `Membership`.
- O convidado recebe uma `Notificação` (kind `invite`). A `Membership` (papel `Membro`) **só passa a existir quando ele aceita**; recusar descarta o `Convite`.
- Se o convidado ainda não tem conta, o `Convite` **aguarda o cadastro** e é apresentado quando ele entra pela primeira vez (a criação JIT do `Usuário` continua; o que muda é que ela não cria mais `Membership` automática).
- Invariante de domínio: **ninguém entra numa `Viagem` sem aceite explícito** (invariante 21).

## Justificativa

- **Consentimento como padrão:** numa plataforma aberta, pertencer a uma `Viagem` é um vínculo social — tem de ser opt-in, não imposto.
- **Backing para o redesenho:** a inbox de Notificações do protótipo pressupõe aceitar/recusar; sem `Convite` persistido, a tela não teria modelo por trás.
- **Aditivo sobre o que já existe:** o fluxo de adicionar-por-e-mail e a criação JIT permanecem; introduzimos um estado intermediário (`Convite`) em vez de reescrever identity.

## Consequências

- **Novo estado a modelar:** `Convite` (e suas transições) passa a viver no boundary que gere membros (`trips`), e dispara `Notificação` via service de `notifications` (ADR-0017).
- **ADR-0003 fica parcialmente superseded:** a parte "adicionar = membership resolvida via JIT" deixa de valer; o gate por allowlist já havia caído no ADR-0013. O ADR-0003 deve apontar para cá.
- **Viagens não aparecem antes do aceite:** um `Convite` pendente não dá leitura à `Viagem`; só a `Membership` (pós-aceite) torna a `Viagem` visível.
- **Convites pendentes acumulam:** precisam de expiração/limpeza eventual — fora de escopo agora, anotado como dívida.

## Opções rejeitadas

- **Manter JIT silencioso:** zero mudança de modelo, mas permite adicionar sem consentimento — inaceitável com cadastro aberto.
- **JIT agora, aceite depois:** pragmático, mas deixaria a tela de Notificações sem backing e adiaria uma decisão que molda o modelo de Membership desde já; preferimos pagar o custo agora que o boundary `notifications` está sendo criado de qualquer forma.
