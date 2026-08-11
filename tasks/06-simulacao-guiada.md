# 06 — Simulação guiada pelo chaveamento

**Valida:** pistoleiro + arlequina + feiticeira (obrigatória)

## Objetivo

Trocar o formulário de texto livre por uma simulação que **parte dos times
reais** e avança fase a fase: o usuário só informa o placar.

## Problema do formulário atual

Hoje a aba Simulação pede **Fase**, **Time A**, **Time B**, **Gols A**,
**Gols B**, com os times digitados à mão. Isso permite:

- errar o nome ("Gremio" em vez de "Grêmio") e não casar com nenhum time
- inventar confronto com time já eliminado, ou que nem está na competição
- montar uma fase inteira sem relação com quem realmente se classificou

E não conversa com o chaveamento ao lado.

## Comportamento desejado

**Ponto de partida.** Os 8 classificados saem das oitavas, derivados dos
agregados reais — não escritos no código:

```
Vitória · Internacional · Palmeiras · Vasco da Gama
Grêmio · Cruzeiro · Santos · Atlético Mineiro
```

**Quartas.** O sorteio ainda não aconteceu, então o usuário monta os
confrontos. Ofereça as duas formas:
- arrastar/selecionar quem enfrenta quem
- botão "Sortear confrontos" que embaralha os 8

**Placar.** Para cada confronto, dois campos de gols. Vencedor calculado pelo
agregado. Empate no agregado → o usuário escolhe quem passa nos pênaltis
(não sorteie sozinho, e não deixe indefinido).

**Avanço.** Fechada uma fase, a seguinte aparece **já preenchida com os
vencedores**, pronta para receber placar. Assim até a final e o campeão.

**Voltar.** Editar o placar de uma fase anterior recalcula tudo à frente e
limpa o que ficou inválido. Não deixe resultado órfão de confronto que não
existe mais.

**Reset.** "Resetar simulação" volta ao estado inicial, com só os 8
classificados.

## Regras inegociáveis

- **Zero escrita no banco.** Tudo em `useState`. Nenhum `fetch` com POST,
  PATCH, PUT ou DELETE. F5 descarta a simulação inteira.
- Resultado simulado **visualmente distinto** do real, em qualquer aba onde
  apareça
- Não é possível escolher time que não se classificou
- Não é possível avançar fase com confronto incompleto

## Arquivos afetados

- `src/components/SimulacaoForm.tsx` — reescrita
- `src/lib/bracket.ts` — reaproveitar `deriveConfrontos` e o cálculo de
  agregado, não duplicar a lógica
- `src/components/App.tsx` — estado da simulação

## Critérios de aceite

- [ ] A aba abre com os 8 classificados reais, derivados do banco
- [ ] Não existe campo de texto livre para nome de time
- [ ] Confrontos das quartas montados pelo usuário ou por sorteio
- [ ] Vencedor pelo agregado; empate resolvido por escolha explícita
- [ ] Fase seguinte aparece preenchida com os vencedores
- [ ] Editar fase anterior recalcula as seguintes sem deixar resíduo
- [ ] "Resetar simulação" volta ao estado inicial
- [ ] F5 descarta tudo
- [ ] Contagem de jogos no banco idêntica antes e depois (99)
- [ ] Nenhuma chamada de escrita à API

## Fora de escopo

Probabilidade de vitória por confronto — depende do modelo de Poisson,
descrito no `MELHORIAS.md`.
