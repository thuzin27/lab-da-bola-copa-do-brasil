# Melhorias do front — lista de trabalho

Insumo para o time do Quarteto Fantástico (`/melhorar-front`).
Ordem de prioridade de cima para baixo.

---

## 1. Corrigir o nome — "Lab da Bota" → "Lab da Bola"

O cabeçalho ainda mostra "Lab da Bota". A correção existe na branch
`feat/sync-enriquecido` (`src/app/layout.tsx`, README, metadata) mas só vale
depois do merge. Conferir se sobrou alguma ocorrência do nome antigo em texto
visível.

O **repositório** e a **URL da Vercel** continuam com o nome antigo de
propósito — não mexer.

---

## 2. Três abas

| Aba | Fonte de dados | Situação |
|---|---|---|
| **Jogos** | tabela `Jogo`, 99 registros | pronta, é a tela atual |
| **Chaveamento** | mesma tabela, agrupada por `round` | em construção em `feat/chaveamento` |
| **Probabilidade** | tabela `Probabilidade` (a criar) | modelo definido, ver seção abaixo |

### Descartado: estatísticas de jogadores

Não é viável com a fonte atual. A TheSportsDB no plano gratuito retorna `null`
em `lookupeventstats` e `lookuplineup`, e o `lookup_all_players` traz só 10
nomes por time, sem nenhum número. Sem escalação, sem gols por jogador, sem
cartões.

### Parado por ora: estatísticas de times

Seria viável — jogos, V/E/D, gols pró e contra, saldo, aproveitamento, fase
alcançada, tudo derivado da tabela `Jogo`, sem depender de fonte nova. A
lógica já existe em Java e pode ser portada:
`D:\datakick\datakick\src\main\java\com\datakick\service\EstatisticasService.java`
(aproveitamento = `(vitórias*3 + empates) / (jogos*3) * 100`).

Fica registrado como opção barata para depois. Não entra no escopo agora.

---

## 3. Problemas visuais observados na tela atual

- **Cabeçalho verde saturado demais.** Destoa do resto, que é escuro e sóbrio.
  Baixar a saturação ou trocar por um cabeçalho neutro com a logo.
- **Os escudos não aparecem.** Os campos `escudoCasa` e `escudoFora` já vêm
  preenchidos em 98 dos 99 jogos e a tela ignora. É o ganho visual mais barato
  que existe aqui.
- **Grade de dois cards com vão morto no meio.** Em tela larga sobra espaço
  central sem função.
- **Sem hierarquia visual.** Data, times e placar competem pela mesma atenção.
  O placar deveria dominar; a data é informação secundária.
- **Confronto de ida e volta não é identificável.** Os dois jogos aparecem
  soltos na lista, sem indicar que são a mesma eliminatória nem qual foi o
  agregado.
- **A página renderiza no cliente.** O HTML em produção chega com
  "Carregando jogos..." — sem SSR, sem indexação, primeiro paint lento.

---

## 4. Regras que valem para qualquer tela

- **Escudo ausente precisa de placeholder.** Betim x Piauí (fase preliminar)
  tem `escudoCasa` e `escudoFora` null porque a fonte não tem as imagens.
  Nunca renderizar `<img src={null}>`. Vai acontecer com mais times pequenos.
- **Datas sempre com `timeZone: 'America/Sao_Paulo'`.**
- **Dado ausente é o caso normal.** Quartas, semifinal e final estão vazias até
  o sorteio. Slot vazio é comportamento correto, não erro.
- **Nada de scroll horizontal na página** em nenhuma largura.
- **Acessibilidade:** escudo com `alt` do nome do time, foco visível, contraste
  AA nos dois temas, `aria-live` nos estados de carregamento.

---

## 5. Modelo de probabilidade — especificação

Base: jogos da Copa do Brasil **mais** Brasileirão Série A 2026
(TheSportsDB liga 4351, ~20 rodadas, 10 jogos por rodada, disponível no plano
gratuito). Os jogos do Brasileirão entram só como insumo de força — não
aparecem na aba de Jogos.

O Brasileirão resolve o problema central: na Copa cada time tem apenas
**4 partidas**, amostra pequena demais para estimar força.

Algoritmo:

1. Por time: `J` (partidas), `GP` (gols pró), `GC` (gols contra).
2. `MU` = total de gols / total de partidas-time.
3. Força com encolhimento:
   - `atk = ((GP + k*MU) / (J + k)) / MU`
   - `def = ((GC + k*MU) / (J + k)) / MU`
   - `k = 8` base; `k = 2` e `k = 20` geram a faixa.
4. Gols esperados (A mandante contra B):
   - `lambda_A = MU * atk_A * def_B * 1.10`
   - `lambda_B = MU * atk_B * def_A / 1.10`
   - sortear com Poisson.
5. Confronto: ida e volta, cada um manda uma, soma o agregado.
   Empate no agregado → pênaltis 50/50. **Sem regra de gol fora** — a Copa do
   Brasil não usa mais.
6. Chaveamento: se existirem jogos do `round` 8 no banco, usar os confrontos
   reais. Se não (caso de hoje), embaralhar os 8 times a cada iteração, para
   que a incerteza do sorteio entre no resultado.
7. 100.000 iterações; contar títulos e classificações à semifinal.

Onde calcular: no fim do `/api/sync`, gravando numa tabela `Probabilidade`.
Nunca a cada request.

Na tela: mostrar **faixa**, não número seco — "Palmeiras 17–22%". E uma nota
visível (não em tooltip):

> Estimativa a partir dos resultados desta temporada. O intervalo reflete a
> incerteza do modelo. O sorteio das quartas ainda não aconteceu e está
> simulado.

### Referência de sanidade (só com dados da Copa, k=8)

Se o modelo rodar apenas com os 4 jogos de cada time na Copa, o resultado é
este. Serve de controle: ao acrescentar o Brasileirão os números vão mudar,
mas a ordem geral não deve virar de cabeça para baixo.

| Time | Campeão | Semifinal |
|---|---|---|
| Palmeiras | 20% | 59% |
| Grêmio | 18% | 57% |
| Vasco | 12% | 50% |
| Santos | 12% | 49% |
| Cruzeiro | 11% | 48% |
| Vitória | 10% | 47% |
| Internacional | 10% | 47% |
| Atlético-MG | 7% | 42% |
