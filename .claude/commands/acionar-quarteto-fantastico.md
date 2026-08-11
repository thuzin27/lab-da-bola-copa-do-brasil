# /acionar-quarteto-fantastico — Time do Front

Você é o coordenador do **Quarteto Fantástico**. Rode os 4 agentes do time de front UM DE CADA VEZ, em sequência, nunca em paralelo — eles editam os mesmos arquivos e se atropelam.

## Passo 0 — leia o backlog antes de qualquer coisa

Leia `MELHORIAS.md` na raiz do projeto. Ele tem a lista de trabalho
priorizada e as regras transversais. Cada herói deve atacar os itens do seu
escopo que estiverem lá, além do checklist próprio dele.

Regras que valem para os quatro, e que estão detalhadas no arquivo:

- Escudo ausente precisa de placeholder — nunca `<img src={null}>`
- Datas sempre com `timeZone: 'America/Sao_Paulo'`
- Dado ausente é o caso normal (quartas, semi e final estão vazias até o sorteio)
- Nada de scroll horizontal em nenhuma largura

## Protocolo obrigatório para cada agente

1. Anuncie qual herói está rodando: `## Rodando: <Nome>`
2. Use o subagente correspondente.
3. Após o agente terminar, rode `npm run build` no diretório do projeto.
4. Se o build **quebrar**: reverta as mudanças daquele agente (`git checkout -- .`), registre o erro no relatório final e continue com o próximo.
5. Se o build **passar**: faça `git add -p` (apenas os arquivos do escopo daquele agente) e `git commit -m "fix(front): <herói> — <resumo curto>"`.

## Sequência de execução

### 1. Sr. Fantástico — Layout e Responsividade
Subagente: `sr-fantastico`

Escopo: `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/`.
Foco: grid/flex, breakpoints, overflow, mobile 320px.
Do backlog: vão morto entre as colunas, hierarquia visual entre data/times/placar.

### 2. Mulher Invisível — Acessibilidade
Subagente: `mulher-invisivel`

Escopo: `src/app/page.tsx`, `src/app/layout.tsx`, `src/components/`.
Foco: semântica HTML, labels, foco, ARIA live, contraste, lang.
Do backlog: `alt` nos escudos, contraste AA nos dois temas, `aria-live` no carregamento.

### 3. Tocha Humana — Performance do Front
Subagente: `tocha-humana`

Escopo: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/`.
Foco: 'use client' desnecessário, fetch waterfall, re-renders, bundle.
Do backlog: a página renderiza no cliente e chega com "Carregando jogos..." no HTML — sem SSR e sem indexação.

### 4. O Coisa — Consistência do Design System
Subagente: `o-coisa`

Escopo: `src/app/page.tsx`, `src/app/globals.css`, pode criar em `src/components/`.
Foco: tokens duplicados, componentes repetidos, estados padronizados, nomenclatura.
Do backlog: cabeçalho verde saturado destoando do resto, escudos existentes no banco e ignorados pela tela.

## Relatório final consolidado

Ao término dos 4 agentes, produza um relatório neste formato exato:

```
# Relatório do Quarteto Fantástico

## Sr. Fantástico
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Pendências:** <lista ou "nenhuma">

## Mulher Invisível
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Pendências:** <lista ou "nenhuma">

## Tocha Humana
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Pendências:** <lista ou "nenhuma">

## O Coisa
**Mudanças aplicadas:** <lista ou "nenhuma">
**Build:** passou / quebrou (revertido)
**Pendências:** <lista ou "nenhuma">

## Itens do MELHORIAS-FRONT.md
- <item> — resolvido por <herói> / não resolvido

## Pendências consolidadas (nenhum herói corrigiu)
- <arquivo:linha> — <descrição>
```
