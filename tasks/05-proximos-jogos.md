# 05 — Aba "Próximos jogos"

**Valida:** pistoleiro + arlequina

## Objetivo

Nova aba mostrando os próximos jogos, com data, horário, escudos e competição.

## ATUALIZADO em 11/08 — o sorteio saiu

Este arquivo foi escrito quando a Copa não tinha jogo futuro nenhum. **Mudou
no mesmo dia:** a CBF sorteou as quartas na manhã de 11/08, no Rio.

⚠️ **Esses 8 jogos NÃO vieram do sync.** A TheSportsDB ainda retorna 0
eventos no `round` 8. Eles foram inseridos à mão por
`scripts/seed-quartas-2026.ts`, direto no banco de produção, e por isso têm
`idExterno` null.

Confrontos e mandos conferem com a imprensa. **Os horários não**: o script
usa 18:30 para os quatro jogos, marcado no próprio código como provisório.
A CBF escalona por transmissão, então esses horários vão mudar.

Quando a TheSportsDB publicar o `round` 8, rodar
`scripts/cleanup-quartas-manuais.ts` (tem dry-run por padrão) para remover os
manuais e ficar só com os oficiais.

```
Internacional x Grêmio          ida 26/08 18:30 · volta 02/09 18:30
Palmeiras x Santos              ida 26/08 18:30 · volta 02/09 18:30
Vasco da Gama x Vitória         ida 26/08 18:30 · volta 02/09 18:30
Cruzeiro x Atlético Mineiro     ida 26/08 18:30 · volta 02/09 18:30
```

São **8 jogos da Copa**, todos por disputar. O banco passou de 99 para 107.

**Consequência para o escopo:** a aba já tem conteúdo próprio da Copa e não
depende mais do Brasileirão para nascer preenchida. O Brasileirão passa a ser
**opcional** — decida com o Arthur antes de sincronizar liga nova, porque ele
traz junto o campo `competicao`, o risco de poluir as outras abas e mais 200
registros no banco.

Recomendação: **fazer a aba só com a Copa primeiro.** É menos código, sem
migration nova, sem risco de contaminar chaveamento e fases anteriores. O
Brasileirão entra depois, se ainda fizer sentido.

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
