# ADR 0010 — Trajetos derivados das Paradas

Status: accepted

`Trajeto`s serão gerados automaticamente a partir da sequência `Origem` → `Parada`s → `Origem`, em vez de serem cadastrados manualmente pelo usuário. A alternativa manual preservava mais liberdade, mas exigia que o usuário entendesse e mantivesse separadamente os nós (`Parada`s) e as arestas (`Trajeto`s), o que já apareceu como confusão na tela da viagem.

Consequência: cadastrar, reordenar ou remover `Parada`s passa a afetar os `Trajeto`s; quando houver `Pesquisa de Passagem` ancorada nos trajetos afetados, a alteração é bloqueada no MVP para não descolar a pesquisa do trecho pretendido.
