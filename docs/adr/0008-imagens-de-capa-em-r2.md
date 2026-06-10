# ADR 0008 — Imagens de Capa em Cloudflare R2

Status: accepted

As `Imagem de Capa`s de `Viagem` e `Parada` serão armazenadas como arquivos no Cloudflare R2, enquanto o Postgres guarda apenas a referência necessária para a aplicação encontrá-las. As alternativas eram salvar binário no Postgres, o que inflaria backups e misturaria arquivo com dado relacional, ou salvar em disco/volume da VPS, o que ficaria frágil no ciclo de deploy em containers do Coolify.

Consequência: upload, validação e remoção de imagens passam pela API; a aplicação não depende do filesystem efêmero do container para preservar capas após redeploy.
