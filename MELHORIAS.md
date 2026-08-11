# Melhorias — backlog do projeto

Lista de trabalho do Lab da Bola. Consumida pelos comandos
`/acionar-quarteto-fantastico` (front) e `/acionar-vingadores` (back).

Levantada a partir do código real na `main` em 10/08/2026, não de memória.

---

## Estado atual — o que já está pronto

- Sync com a TheSportsDB, **99 jogos** da Copa do Brasil 2026 (11/08/2026),
  com escudos, `round`, `status` e `estadio`:
  Preliminar 15 · Primeira Fase 24 · Segunda Fase 12 · Terceira Fase 32 ·
  Oitavas 16 · Quartas 0 (sorteio pendente)
- Chaveamento das oitavas até a final, com agregado, detecção de pênaltis e
  slots "A definir"
- Bug de fuso corrigido (`strTime` já vem em UTC)
- Rota `/api/sync` protegida por `CRON_SECRET`, cron diário às 12:00 UTC
- Índice em `dataJogo`, `idExterno` como `@unique`
- Rename para "Lab da Bola" aplicado
- Deploy automático a cada push na `main`

Vingadores rodaram **3 dos 5** heróis: Homem de Ferro, Capitão América e
Hulk. **Viúva Negra (segurança) e Visão (integridade) nunca rodaram** — a
sessão morreu antes. É a primeira coisa a fazer.

---

## Front — o que a Fase 3 já fechou (commit 8f02445)

- ✅ `page.tsx` de 479 → **16 linhas**
- ✅ `src/components/` criado com 9 componentes (App, BracketDesktop,
  BracketMobile, BracketConnectors, MatchCard, EmptySlot, Escudo,
  FasesAnteriores, SimulacaoForm)
- ✅ Abas acessíveis com `role="tab"` / `aria-selected`
- ✅ Header com logo da Copa
- ✅ "Fases anteriores" migrado do colapsável para aba
- ✅ Simulação 100% client-side, sem escrita no banco

Estatística de jogadores segue **descartada**: a TheSportsDB no plano
gratuito retorna `null` em `lookupeventstats` e `lookuplineup`, e
`lookup_all_players` traz só 10 nomes por time sem nenhum número.

## Front — pendências (trabalho do Quarteto Fantástico)

O Quarteto **ainda não rodou**. Estes itens continuam abertos:

### Performance e renderização — `tocha-humana`

- **Os 9 componentes são `'use client'`, sem exceção.** Os dados chegam por
  `fetch('/api/jogos')` dentro de `useEffect`, então o HTML de produção sai
  vazio: sem SSR, sem indexação, primeiro paint esperando o JavaScript.
  A extração em componentes não resolveu isso — só reorganizou.
- O chaveamento e as fases anteriores são conteúdo estático por request:
  candidatos naturais a server component, deixando no cliente apenas a
  troca de abas e o formulário de simulação.

### Robustez visual — `sr-fantastico` + `o-coisa`

- **`Escudo.tsx` não referencia `escudo-placeholder.svg`.** O componente
  aceita `src: string | null`, mas o arquivo em `public/` não é usado.
  Confirmar o que aparece hoje quando o escudo é null (caso Betim x Piauí).
- Hierarquia visual: data, times e placar competem pela mesma atenção; o
  placar deveria dominar.
- Vão morto entre as colunas do bracket em tela larga.
- Revisar a saturação do cabeçalho no tema escuro.

### Acessibilidade — `mulher-invisivel`

- Navegação por setas do teclado entre abas (o `role` está, falta confirmar
  o comportamento).
- Aba ativa refletida na URL, para recarregar e botão voltar funcionarem.
- Contraste AA nos dois temas.

---

## Back e dados — pendências

- **Falta `@@index([round])`.** Hoje só existe `@@index([dataJogo])`. A
  consulta principal do chaveamento filtra por `round`, e é a que mais roda.
  Migration à mão, nunca `prisma migrate dev`.
- **Rodar Viúva Negra e Visão**, que ficaram de fora.
- `screenshot.mjs` está na raiz do repositório. Decidir se vira script de
  desenvolvimento em `scripts/` ou sai.

---

## Próxima feature — aba de Probabilidade

Calcular probabilidade de **título** e de **classificação à semifinal**.

### Dados

Sincronizar também o **Brasileirão Série A 2026** (TheSportsDB liga **4351**,
~20 rodadas × 10 jogos, disponível no plano gratuito). Entra só como insumo
de força; não aparece na aba de Jogos.

Isso é o que torna o modelo defensável: na Copa cada um dos 8 classificados
tem apenas **4 partidas**. Com o Brasileirão, passam de ~24.

Falta criar a tabela `Probabilidade` — ela não existe no schema.

### Algoritmo

1. Por time: `J` (partidas), `GP` (gols pró), `GC` (gols contra)
2. `MU` = total de gols / total de partidas-time
3. Força com encolhimento:
   - `atk = ((GP + k*MU) / (J + k)) / MU`
   - `def = ((GC + k*MU) / (J + k)) / MU`
   - `k = 8` base; `k = 2` e `k = 20` geram a faixa
4. Gols esperados (A mandante contra B):
   - `lambda_A = MU * atk_A * def_B * 1.10`
   - `lambda_B = MU * atk_B * def_A / 1.10`
   - sortear com Poisson
5. Confronto: ida e volta, cada um manda uma, soma o agregado.
   Empate → pênaltis 50/50. **Sem gol fora** — a Copa não usa mais.
6. Chaveamento: se existirem jogos do `round` 8, usar os confrontos reais.
   Se não (caso de hoje), embaralhar os 8 a cada iteração, para a incerteza
   do sorteio entrar no resultado.
7. 100.000 iterações

Calcular no fim do `/api/sync` e gravar na tabela. **Nunca a cada request.**

### Na tela

Mostrar **faixa**, não número seco: "Palmeiras 17–22%". E uma nota visível,
fora de tooltip:

> Estimativa a partir dos resultados desta temporada. O intervalo reflete a
> incerteza do modelo. O sorteio das quartas ainda não aconteceu e está
> simulado.

### Referência de sanidade (só com dados da Copa, k=8)

Se o modelo rodar apenas com os 4 jogos da Copa, é isto que sai. Ao
acrescentar o Brasileirão os números mudam, mas a ordem geral não deve virar
de cabeça para baixo. Serve de teste de aceitação.

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

---

## Regras que valem para qualquer trabalho aqui

- **Escudo ausente precisa de placeholder** — nunca `<img src={null}>`
- **Datas sempre com `timeZone: 'America/Sao_Paulo'`**
- **Dado ausente é o caso normal** — quartas, semi e final vazias até o sorteio
- **Sem scroll horizontal** em nenhuma largura
- **Nunca `prisma migrate dev`** (Prisma 7 recusa ambiente não-interativo)
- **Nunca `prisma migrate reset`** — os worktrees compartilham o mesmo banco
- Acessibilidade: `alt` nos escudos, foco visível, contraste AA nos dois
  temas, `aria-live` no carregamento

---

## Dívida conhecida — não é bug

- **Sem dados de pênaltis.** `intHomeScoreExtra` vem sempre null. Empate no
  agregado é indeterminável: mostrar "não disponível", nunca chutar.
- **Sem ligação entre fases.** A API não tem campo de chaveamento; o
  confronto é derivado agrupando ida e volta por id de time.
- **Grafo do graphify diluído.** Dos 1302 nós, a maioria é documentação do
  Prisma vinda de `.claude/skills/`. Consultas sobre o código do projeto
  trazem teoria de driver adapter. Vale excluir `.claude/skills/` da
  extração. Rodar `graphify update .` após mudanças — o grafo atual foi
  construído em `a59b4b5`, antes dos merges.
