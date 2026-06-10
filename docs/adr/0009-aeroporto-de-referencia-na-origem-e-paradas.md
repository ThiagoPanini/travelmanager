# ADR 0009 — Aeroporto de Referência na Origem e nas Paradas

Status: accepted

`Origem` e `Parada`s passam a ter um `Aeroporto de Referência`, usado para mostrar a rota planejada com código de aeroporto acompanhado da cidade. Isso substitui a heurística de derivar códigos a partir de nomes e evita que a interface invente siglas instáveis.

O `Aeroporto de Referência` não muda a granularidade da `Pesquisa de Passagem`: uma pesquisa ainda registra os aeroportos efetivamente encontrados, que podem diferir do aeroporto escolhido como referência visual da cidade.
