# ADR 0011 — Período da Viagem como dado próprio

Status: accepted

A `Viagem` terá `data de ida` e `data de volta` próprias, informadas no momento de criação, em vez de derivar essas datas apenas das `Parada`s. Embora isso crie uma relação a ser mantida com a primeira e a última `Parada`, a decisão deixa o intervalo geral da viagem explícito desde o início e permite que cards e headers mostrem as datas mesmo antes de todo o itinerário estar detalhado.

Consequência: a `Viagem` pode nascer sem `Parada`s, mas, quando houver paradas, a primeira começa na `data de ida` da `Viagem`, e a última termina na `data de volta`; alterações na sequência de `Parada`s precisam preservar essa relação. O sistema pode sugerir datas iniciais, mas não redistribui automaticamente dias entre cidades.
