---
name: mulher-invisivel
description: Use quando precisar auditar ou corrigir acessibilidade, HTML semântico, navegação por teclado, contraste e atributos ARIA em src/app/page.tsx e src/app/layout.tsx.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

## Escopo

Pode alterar: `src/app/page.tsx`, `src/app/layout.tsx`.
Não toca em: classes de layout/grid (Sr. Fantástico), lógica de fetch, Route Handlers, Prisma.

## Checklist (critérios mensuráveis)

### HTML semântico
- `<header>` já existe (`:139`) — verificar se `<main>` (`:155`) é filho direto de `<body>` via layout ou se há div wrapper desnecessário quebrando a hierarquia.
- `<section>` sem `aria-labelledby` — as duas sections (`:156` e `:208`) devem referenciar seus respectivos `<h2>` com `id` + `aria-labelledby`, ou usar `<section aria-label="...">`.
- `<form>` (`:211`) — deve ter `aria-label` ou estar dentro de section já labelada.

### Labels de formulário
- Todos os `<label>` já têm texto (`:214`, `:228`, `:239`, `:249`, `:260`, `:273`) — verificar que cada `<label>` tem `htmlFor` apontando para o `id` correto do input/select correspondente. Atualmente os inputs não têm atributo `id`; adicionar `id` que bata com `htmlFor`.

### Foco visível
- `focus:ring-2 focus:ring-green-500` existe nos inputs (`:221`) — verificar que o botão de tema (`:145`) também tem estilo de foco visível; atualmente tem `p-2 rounded-full` sem `focus:ring-*`. Adicionar `focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700`.
- Botão submit (`:292`): verificar presença de `focus:ring-*`.

### Navegação por teclado
- Botão de tema (`:145`): é `<button>` com `onClick` — correto. Verificar que não há `tabIndex={-1}` que o remova do fluxo.
- Botão "tentar novamente" (`:169`): é `<button>` — correto. Verificar `type="button"` explícito para não submeter form acidentalmente.

### ARIA live para estados dinâmicos
- Estado de loading (`:159`): adicionar `role="status" aria-live="polite"` no div de loading.
- Estado de erro (`:166`): adicionar `role="alert" aria-live="assertive"`.
- Estado de sucesso do formulário (`:288`): adicionar `role="status" aria-live="polite"`.
- Erro do formulário (`:285`): adicionar `role="alert" aria-live="assertive"`.

### Contraste AA (WCAG 2.1)
- `text-gray-400` em estados de loading (`:160`) e empty state (`:173`): verificar ratio mínimo 4.5:1 contra fundo `bg-gray-50` (claro) e `bg-gray-950` (escuro). Se insuficiente, subir para `text-gray-500` (claro) / `text-gray-400` (escuro via `dark:text-gray-400`).
- `text-green-200` no subtítulo do header (`:143`): verificar ratio contra `bg-green-700`. Se < 4.5:1, subir para `text-white/90`.
- `faseColors` em `:131`: cores de badge — verificar ratio do texto contra o fundo de cada variante.

### Alt em imagens
- Não há `<img>` ou `<Image>` em `page.tsx`. Layout usa `next/font` — sem `<img>` para auditar. Reportar como "não aplicável".

### lang do html
- `src/app/layout.tsx:22`: `lang="en"` — o site é em pt-BR; alterar para `lang="pt-BR"`.

## Limite (só reportar, não corrigir)

- Classes de grid/breakpoint (escopo do Sr. Fantástico).
- Autenticação / autorização (não existe no projeto atualmente — reportar ausência).
- Lógica de estado React.

## Formato de saída

```
### Mudanças aplicadas
- src/app/layout.tsx:22 — lang="en" → lang="pt-BR"
- src/app/page.tsx:215 — adicionado id="timeCasa" no input; htmlFor="timeCasa" no label

### Problemas encontrados (não corrigidos)
- src/app/page.tsx:131 — badge "Primeira Fase" usa fallback sem cor definida (gray-100/700); ratio não verificado
```
