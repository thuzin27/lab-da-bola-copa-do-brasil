# 03 — "Fases anteriores" vira aba

**Valida:** pistoleiro

## Objetivo

Tirar o "Fases anteriores" do colapsável solto no fim da página e mover para
a aba **Fases anteriores** criada na tarefa 02. Os jogos continuam
carregando igual, só que dentro da aba.

## Arquivos afetados

- `src/app/page.tsx` — componente `FasesAnteriores` (linha ~283)
- `src/components/` — destino após a extração da tarefa 02

## Números reais (conferidos no banco em 10/08/2026)

O banco tem **100 jogos**:

```
Preliminar        15
Primeira Fase     24
Segunda Fase      12
Terceira Fase     32
Oitavas de Final  16
Quartas de Final   1
```

"Fases anteriores" = tudo que não é bracket (rounds 16, 8, 4, 2) = **83 jogos**.

Esse número **muda com o tempo**: o sorteio das quartas está saindo e o sync
roda todo dia às 12:00 UTC. Não fixe 83 em lugar nenhum do código — calcule.
O critério é o `round`, não a contagem.

## Trabalho

- Mover o conteúdo para o `tabpanel` correspondente
- Remover o `<details>`/colapsável — dentro da aba ele não faz mais sentido
- Manter a contagem visível ("83 jogos"), calculada em tempo real
- Agrupar por fase, na ordem do torneio (Terceira → Segunda → Primeira →
  Preliminar), com o mesmo tratamento visual dos cards do chaveamento
- Escudos e placeholder quando o escudo for null (Betim x Piauí)

## Critérios de aceite

- [ ] Os 83 jogos aparecem dentro da aba
- [ ] Nenhum jogo de bracket (oitavas, quartas, semi, final) vaza para cá
- [ ] Nenhum jogo aparece em duas abas ao mesmo tempo
- [ ] Contagem calculada, nunca escrita à mão no código
- [ ] Colapsável antigo removido da página principal
- [ ] Escudo ausente cai no placeholder, sem imagem quebrada
- [ ] Sem scroll horizontal com a lista cheia

## Fora de escopo

Aba "Simulação" (tarefa 04).
