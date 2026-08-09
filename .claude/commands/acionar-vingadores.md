# /acionar-vingadores — Time do Back

Você é o coordenador de **Os Vingadores**. Rode os 5 agentes do time de back UM DE CADA VEZ, em sequência, nunca em paralelo — eles editam os mesmos arquivos e se atropelam.

## Passo 0 — contexto obrigatório

Leia o `CLAUDE.md`, em especial a seção **"Armadilhas que já custaram bug"**.
Vários itens de lá são exatamente o tipo de coisa que um agente "conserta" e
quebra de novo:

- `strTime` da TheSportsDB **já vem em UTC** — somar offset adianta tudo em 3h
- Não existem dados de pênaltis (`intHomeScoreExtra` sempre null)
- `idExterno` é `@unique` e o sync faz upsert por ele — **nunca** `deleteMany`
- Jogo com `idExterno` null foi cadastrado à mão e não pode ser apagado
- **Nunca** `prisma migrate dev` (Prisma 7 recusa ambiente não-interativo) nem
  `prisma migrate reset` (os worktrees compartilham o mesmo banco)

## Protocolo obrigatório para cada agente

1. Anuncie qual herói está rodando: `## Rodando: <Nome>`
2. Use o subagente correspondente.
3. Após o agente terminar, rode `npm run build` no diretório do projeto.
4. Se o build **quebrar**: reverta as mudanças daquele agente (`git checkout -- .`), registre o erro no relatório final e continue com o próximo.
5. Se o build **passar**: faça `git add -p` (apenas os arquivos do escopo daquele agente) e `git commit -m "fix(back): <herói> — <resumo curto>"`.

## Sequência de execução

### 1. Homem de Ferro — Arquitetura da API
Subagente: `homem-de-ferro`

Escopo: `src/app/api/`, `src/lib/`.
Foco: separação handler/negócio, tipagem ponta a ponta, helpers reutilizáveis.

### 2. Capitão América — Contrato HTTP
Subagente: `capitao-america`

Escopo: `src/app/api/jogos/route.ts`, `src/app/api/jogos/[id]/route.ts`, `src/app/api/sync/route.ts`.
Foco: status codes, formato de erro, cobertura zod, idempotência.

### 3. Viúva Negra — Segurança
Subagente: `viuva-negra`

Escopo: leitura de tudo; escrita apenas em .gitignore e remoção de segredos.
Foco: segredos no repo, exposição de dados, CORS, rate limit, mass assignment,
proteção do `CRON_SECRET` na rota de sync.
**Atenção:** este agente NÃO aplica mudanças de comportamento — apenas reporta com diff proposto.

### 4. Hulk — Performance e Escala
Subagente: `hulk`

Escopo: `src/app/api/`, `prisma/schema.prisma`, migrations.
Foco: N+1, índices, paginação, connection pooling, timeout Vercel.
**Migration só à mão:** crie o SQL em `prisma/migrations/<timestamp>_<nome>/migration.sql` e aplique com `migrate deploy`.

### 5. Visão — Integridade de Dados
Subagente: `visao`

Escopo: `prisma/`.
Foco: tipos, nullability, constraints, consistência schema/migration/seed, seed roda limpo.

## Relatório final consolidado

Ao término dos 5 agentes, produza um relatório neste formato exato:

```
# Relatório dos Vingadores

## Homem de Ferro
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Pendências:** <lista ou "nenhuma">

## Capitão América
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Pendências:** <lista ou "nenhuma">

## Viúva Negra
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Riscos encontrados:** <lista com severidade ou "nenhum">
**Diffs propostos:** <lista ou "nenhum">

## Hulk
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Pendências:** <lista ou "nenhuma">

## Visão
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Pendências:** <lista ou "nenhuma">

## Pendências consolidadas (nenhum herói corrigiu)
- <arquivo:linha> — <descrição> [severidade: baixa/média/alta]
```
