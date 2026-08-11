# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Comandos

```bash
npm run dev    # servidor local
npm run build  # prisma migrate deploy && next build (igual ao Vercel)
npm run seed   # sync real com TheSportsDB → banco de produção
npm run lint   # eslint

# Prisma — sempre com DATABASE_URL disponível antes
npx prisma generate                        # regenerar client após mudar schema
npx prisma migrate deploy                  # aplicar migrations pendentes (não-interativo)
npx tsx --env-file=.env.local <script.ts>  # scripts ad-hoc contra o banco
```

**Nunca use `prisma migrate dev`** — o Prisma 7 recusa ambientes não-interativos.
Crie o SQL manualmente em `prisma/migrations/<timestamp>_<nome>/migration.sql`
e aplique com `migrate deploy`.

Scripts `tsx` precisam de `--env-file=.env.local` porque `import` de módulos é
hoistado antes das chamadas `dotenv.config()`.

## Idioma

Responda sempre em **português do Brasil**, inclusive nos blocos de
raciocínio, nos relatórios de subagente e nas mensagens de commit. Nomes de
arquivo, código, comandos e termos técnicos consagrados (build, commit,
deploy, merge) ficam como estão.

## Processo — validação obrigatória antes de commitar

**Nenhuma alteração é commitada sem passar pelo Esquadrão Suicida.** Os
vilões existem para tentar quebrar o que foi feito; commit sem veredito é
commit não verificado.

Fluxo, sem exceção:

1. Implemente a alteração
2. Dispare o(s) vilão(ões) correspondente(s) via subagente
3. Só commite com **VEREDITO: APROVADO**
4. Se vier REPROVADO: corrija e rode o vilão de novo. Não commite "para não
   perder o trabalho" — use `git stash` se precisar

Qual vilão chamar:

| Tipo de alteração | Vilão |
|---|---|
| Layout, CSS, componente, header, responsividade, estado vazio | `arlequina` |
| Aba, listagem, contagem de jogos, bracket, agregado, simulação | `pistoleiro` |
| Qualquer coisa que toque banco, formulário ou rota de escrita | `feiticeira` (obrigatória) |
| Antes de abrir PR ou mergear, sempre | `capitao-bumerangue` |

Quando a alteração cruza áreas, chame mais de um. A `feiticeira` tem poder de
veto: um único FALHOU dela reprova a rodada inteira, mesmo que os outros
tenham aprovado.

O `capitao-bumerangue` roda por último, no projeto inteiro (`tsc`, `lint`,
`next build`), e é o único que libera o PR.

Os heróis Marvel (`.claude/agents/`, times Quarteto Fantástico e Vingadores)
**constroem e melhoram**. Os vilões DC **testam e reprovam**. Não misture os
papéis: vilão não conserta, herói não se autoaprova.

## O projeto

Lab da Bola — painel da Copa do Brasil. Next.js (App Router) + TypeScript +
Tailwind, backend em Route Handlers, Prisma + Postgres (Neon), deploy na Vercel
com deploy automático a cada push na `main`.

O nome antigo era "Lab da Bota". O repositório e a URL da Vercel ainda usam o
nome antigo de propósito — só os textos visíveis foram corrigidos.

## Fonte de dados: TheSportsDB

- Base: `https://www.thesportsdb.com/api/v1/json/123` (chave pública, 30 req/min)
- Copa do Brasil = liga **4725**. Brasileirão Série A = 4351.
- Endpoint correto: `/eventsround.php?id=4725&r={round}&s=2026`
- **Não use `/eventsseason.php`**: no plano gratuito ele vem truncado, retorna
  só 15 jogos, todos da primeira fase. Foi verificado.
- `round` é o número de times na fase:
  `1256` preliminar · `128` · `64` · `32` · `16` oitavas · `8` quartas ·
  `4` semifinal · `2` final
- Fase sem jogos retorna `{"events": null}`. Isso é normal, não é erro.

## Armadilhas que já custaram bug

- **`strTime` já vem em UTC.** `strTimeLocal` é que é horário de Brasília.
  Somar offset em cima do `strTime` adianta tudo em 3h e joga jogos da noite
  para o dia seguinte. Use `strTimestamp` como UTC. Já foi corrigido uma vez.
- **Não existem dados de pênaltis.** `intHomeScoreExtra` e `intAwayScoreExtra`
  vêm sempre null. Se um confronto empatar no agregado, o vencedor é
  indeterminável — mostre "não disponível", nunca chute.
- **A API não liga uma fase à seguinte.** Não há campo de chaveamento. O
  confronto se deriva agrupando ida e volta por `idTimeCasa`/`idTimeFora`
  (por id, não por nome) e somando o agregado.
- **`idExterno` é o `idEvent` da API e é `@unique`.** O sync faz upsert por
  ele. Nunca use `deleteMany` antes de inserir.
- **Jogo com `idExterno` null foi cadastrado à mão** pelo formulário. Nunca
  apague por esse critério sozinho — já houve uma limpeza que precisou do
  filtro duplo `idExterno IS NULL AND dataJogo < 2026-01-01`.
- **Escudos vêm em `strHomeTeamBadge`/`strAwayTeamBadge`.** O domínio
  `r2.thesportsdb.com` precisa estar em `images.remotePatterns` no
  `next.config`, senão o `next/image` bloqueia e a tela fica vazia.
- **Datas na UI sempre com `timeZone: 'America/Sao_Paulo'`.**

## Estado do campeonato

As oitavas terminaram em 06/08/2026. Quartas, semifinal e final estão **vazias**
até o sorteio. Dado ausente nessas fases é o caso normal, não um bug — os slots
se preenchem sozinhos no primeiro sync depois do sorteio.

## Operação

- `/api/sync` é protegido pelo header `CRON_SECRET`. Sem isso qualquer um
  dispara o sync e queima a cota da API.
- Existem worktrees (`../lab-front`, `../lab-back`) que **compartilham o mesmo
  banco** via o mesmo `.env.local`. Nunca rode `prisma migrate reset` — apaga o
  banco dos três de uma vez.
