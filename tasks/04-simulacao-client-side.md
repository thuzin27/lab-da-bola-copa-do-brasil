# 04 — Simulação 100% client-side

**Valida:** feiticeira (obrigatório) + pistoleiro

## Objetivo

Mover o formulário "Cadastrar jogo" para a aba **Simulação**, agora
inteiramente no cliente. O resultado hipotético entra só no estado do React,
alimenta o bracket na hora marcado como simulado, e um botão limpa tudo.

**Nenhuma escrita no banco.**

## Motivação — o bug que isso encerra

Hoje o formulário faz `POST /api/jogos` (`src/app/page.tsx`, linha ~322) e a
rota **não tem autenticação**. Qualquer visitante do site em produção pode
gravar e editar jogos no banco compartilhado. É o bug mais grave em aberto.

## Arquivos afetados

- `src/app/page.tsx` — `AdminForm` (linha ~312)
- `src/components/`
- `src/app/api/jogos/route.ts` — `POST`
- `src/app/api/jogos/[id]/route.ts` — `PATCH`, `DELETE`

## Trabalho

**Simulação local**

- O formulário grava num `useState`, nunca num `fetch` de escrita
- O bracket deriva de `[...jogosReais, ...jogosSimulados]`
- Confronto que contém jogo simulado fica **visualmente distinguível** —
  borda, etiqueta "simulado", ou ambos. Nunca confundível com resultado real
- Botão **"Resetar simulação"** devolve ao estado original
- Recarregar a página descarta a simulação (é estado local, não persiste)
- Simular → resetar → simular de novo funciona sem estado sujo

**Endpoints públicos de escrita**

`POST /api/jogos`, `PATCH` e `DELETE /api/jogos/[id]` deixam de ser
necessários.

⚠️ **CONFIRMAR COM O ARTHUR ANTES DE DELETAR.** Apresente as duas opções:

1. Remover as rotas
2. Mantê-las exigindo `CRON_SECRET`, no mesmo padrão de `/api/sync`

`GET /api/jogos` e `GET /api/jogos/[id]` **permanecem** — a página depende deles.

## Critérios de aceite

- [ ] Nenhum `fetch` com method POST/PATCH/PUT/DELETE no fluxo de simulação
- [ ] Nenhuma chamada a `prisma.create/update/delete/upsert` vinda da página
- [ ] Contagem de jogos no banco idêntica antes e depois de simular
- [ ] Jogo simulado visualmente distinguível do real
- [ ] "Resetar simulação" limpa por completo
- [ ] Recarregar descarta a simulação
- [ ] Endpoints públicos de escrita respondem 401/403/404/405 — nunca 200/201
- [ ] `GET` continua funcionando
- [ ] Decisão sobre remover ou bloquear as rotas **confirmada com o Arthur**

## Fora de escopo

Modelo de probabilidade — está no `MELHORIAS.md`, é outra rodada.
