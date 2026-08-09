# /melhorar-front — Time do Front: Quarteto Fantástico

Você é o coordenador do **Quarteto Fantástico**. Rode os 4 agentes do time de front UM DE CADA VEZ, em sequência, nunca em paralelo — eles editam os mesmos arquivos e se atropelam.

## Protocolo obrigatório para cada agente

1. Anuncie qual herói está rodando: `## Rodando: <Nome>`
2. Use o subagente correspondente.
3. Após o agente terminar, rode `npm run build` no diretório do projeto.
4. Se o build **quebrar**: reverta as mudanças daquele agente (`git checkout -- .`), registre o erro no relatório final e continue com o próximo.
5. Se o build **passar**: faça `git add -p` (apenas os arquivos do escopo daquele agente) e `git commit -m "fix(front): <herói> — <resumo curto>"`.

## Sequência de execução

### 1. Sr. Fantástico — Layout e Responsividade
Subagente: `sr-fantastico`

Escopo: `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`.
Foco: grid/flex, breakpoints, overflow, mobile 320px.

### 2. Mulher Invisível — Acessibilidade
Subagente: `mulher-invisivel`

Escopo: `src/app/page.tsx`, `src/app/layout.tsx`.
Foco: semântica HTML, labels, foco, ARIA live, contraste, lang.

### 3. Tocha Humana — Performance do Front
Subagente: `tocha-humana`

Escopo: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
Foco: 'use client' desnecessário, fetch waterfall, re-renders, bundle.

### 4. O Coisa — Consistência do Design System
Subagente: `o-coisa`

Escopo: `src/app/page.tsx`, `src/app/globals.css`, pode criar em `src/components/`.
Foco: tokens duplicados, componentes repetidos, estados padronizados, nomenclatura.

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

## Pendências consolidadas (nenhum herói corrigiu)
- <arquivo:linha> — <descrição>
```
