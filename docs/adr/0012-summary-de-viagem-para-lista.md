# ADR 0012 — Summary de Viagem para lista

Status: accepted

A lista de `Viagem`s terá um contrato próprio de summary vindo da API, em vez de o frontend buscar `Parada`s e demais dados card-a-card. A alternativa de chamadas adicionais por `Viagem` criaria N+1 justamente na tela mais acessada e espalharia no frontend a montagem de dados que pertencem ao caso de uso de listagem.

Consequência: o endpoint de listagem deve entregar os dados mínimos para renderizar o cartão de embarque da `Viagem`, incluindo `Parada`s ordenadas, aeroportos/cidades, datas e referência de `Imagem de Capa`.
