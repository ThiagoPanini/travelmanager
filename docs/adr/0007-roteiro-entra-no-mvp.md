# ADR 0007 — Roteiro entra no MVP

Status: accepted

O `Roteiro` deixa de ser uma promessa futura e passa a fazer parte do MVP porque a `Parada` só cumpre seu papel de organização da viagem quando também concentra o plano compartilhado daquela estadia. A alternativa era manter apenas `Parada`s e `Pesquisa de Passagem`s no primeiro corte, mas isso deixaria fora um dos comportamentos centrais do produto: o grupo decidir, em um só lugar, tanto como chega quanto o que pretende fazer em cada cidade.

Consequência: o boundary `trips` passa a tratar `Roteiro` e `Item de Roteiro` como conceitos de domínio do MVP, ligados à `Parada`, enquanto decisões mais sofisticadas de agenda ficam fora desta decisão.
