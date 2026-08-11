# 05 — Aba "Próximos jogos"

**Valida:** pistoleiro + arlequina

## Objetivo

Nova aba mostrando os próximos jogos, com data, horário, escudos e competição.

## O problema de escopo

**A Copa do Brasil não tem nenhum jogo futuro.** Conferido na fonte em
11/08/2026:

```
eventsnextleague.php?id=4725      -> 0 eventos
eventsround.php?id=4725&r=8       -> 0 eventos (quartas, sorteio pendente)
```

Uma aba só com a Copa nasce vazia. Por isso a aba usa o **Brasileirão Série A
2026** (liga **4351**) como fonte principal, e passa a incluir a Copa
automaticamente quando as quartas forem sorteadas.

## Dados disponíveis (conferido em 11/08/2026)

```
rodada 23 -> 10 jogos, 15 e 16/08, com horário
rodada 24 -> 10 jogos, 22/08
```

**Não use `eventsnextleague.php`** — no plano gratuito ele retorna apenas
**1 evento**. Mesma limitação do `eventsseason.php`. Use `eventsround.php`
percorrendo as rodadas.

## Armadilha — jogo adiado não é jogo futuro

A rodada 21 tem **4 jogos sem placar com data de 29/07/2026**: são adiados,
não futuros. Filtrar só por `intHomeScore === null` traz jogo do passado.

O critério correto é **sem placar E data no futuro**. Considere exibir os
adiados numa seção própria ("Adiados"), nunca misturados com os próximos.

## Arquivos afetados

- `src/lib/theSportsDb.ts` — buscar rodadas do Brasileirão
- `src/lib/sync.ts` — gravar com `competicao` distinguindo Copa de Brasileirão
- `prisma/schema.prisma` — campo `competicao` no model `Jogo` (migration à mão)
- `src/components/App.tsx` — nova aba
- `src/components/` — componente da listagem

## Regra de separação

Jogo do Brasileirão **não pode** aparecer no chaveamento nem na aba "Fases
anteriores". Essas duas continuam filtrando só Copa do Brasil. Sem o campo
`competicao`, os 83 jogos das fases anteriores viram 100 e o Pistoleiro
reprova — com razão.

## Critérios de aceite

- [ ] Aba lista os jogos futuros com data, horário (fuso de São Paulo),
      escudos e nome da competição
- [ ] Nenhum jogo com data passada aparece como "próximo"
- [ ] Jogos adiados, se exibidos, ficam em seção separada e rotulada
- [ ] Chaveamento continua só com Copa do Brasil
- [ ] "Fases anteriores" continua com **83 jogos** — não pode virar 100+
- [ ] Escudo ausente cai no placeholder
- [ ] Quando as quartas da Copa saírem, entram nesta aba sem mudança de código
- [ ] Sem scroll horizontal em nenhuma largura

## Fora de escopo

Probabilidade de vitória por jogo — está no `MELHORIAS.md`, depende do modelo
de Poisson e é outra rodada.
