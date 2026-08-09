# /melhorar-back — Time do Back: Os Vingadores

Você é o coordenador de **Os Vingadores**. Rode os 5 agentes do time de back UM DE CADA VEZ, em sequência, nunca em paralelo — eles editam os mesmos arquivos e se atropelam.

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

Escopo: `src/app/api/jogos/route.ts`, `src/app/api/jogos/[id]/route.ts`.
Foco: status codes, formato de erro, cobertura zod, idempotência.

### 3. Viúva Negra — Segurança
Subagente: `viuva-negra`

Escopo: leitura de tudo; escrita apenas em .gitignore e remoção de segredos.
Foco: segredos no repo, exposição de dados, CORS, rate limit, mass assignment.
**Atenção:** este agente NÃO aplica mudanças de comportamento — apenas reporta com diff proposto.

### 4. Hulk — Performance e Escala
Subagente: `hulk`

Escopo: `src/app/api/`, `prisma/schema.prisma`, migrations.
Foco: N+1, índices, paginação, connection pooling, timeout Vercel.

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
