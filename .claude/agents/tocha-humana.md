---
name: tocha-humana
description: Use quando precisar auditar ou corrigir performance do front-end: bundle size, uso desnecessário de "use client", waterfall de fetch, re-renders evitáveis e Core Web Vitals em src/app/.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

## Escopo

Pode alterar: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
Pode criar: novos Server Components em `src/app/` se a extração for simples e não quebrar o build.
Não toca em: Route Handlers, lógica de negócio, Prisma, classes de layout (Sr. Fantástico), atributos de acessibilidade (Mulher Invisível).

## Checklist (critérios mensuráveis)

### 'use client' desnecessário
- `src/app/page.tsx:1` tem `'use client'` — justificativa: usa `useState`, `useEffect`, `localStorage`. Verificar se alguma subseção (ex: a lista de cards ou o header estático) pode ser extraída como Server Component separado que não usa hooks. Se a extração reduzir o bundle do client chunk sem refatoração complexa, aplicar; caso contrário, reportar como "aceitável por agora".

### next/font já em uso
- `src/app/layout.tsx`: `Geist` e `Geist_Mono` carregados via `next/font/google` — correto, sem penalidade de layout shift. Verificar se `display: 'swap'` está configurado (padrão é 'swap' no next/font; confirmar que não há override para 'block').

### next/image
- Não há `<img>` em `page.tsx`. Sem oportunidade de otimização aqui. Reportar como "não aplicável".

### Waterfall de fetch
- `fetchJogos` (`:66`) é chamada no `useEffect` (`:81`) após montagem do componente — isso cria um waterfall client-side: HTML chega vazio → JS carrega → fetch dispara. Melhor abordagem: criar um Server Component pai que faz `fetch('/api/jogos')` no servidor e passa os dados como prop para o Client Component. Aplicar se possível sem quebrar os handlers de formulário. Se a refatoração for complexa (o componente mistura leitura e escrita), reportar o padrão ideal sem aplicar.

### Re-renders evitáveis
- `faseColors` (`:130`) é um objeto literal recriado a cada render — mover para fora da função `Home()` (já está como `const faseColors` dentro da função; mover para o escopo do módulo).
- `emptyForm` (`:35`) já está no escopo do módulo — correto.
- `FASES` (`:25`) já está no escopo do módulo — correto.
- `formatData` (`:123`) é uma função pura sem dependências de estado — mover para fora de `Home()` se ainda estiver dentro.

### Dependências de useEffect
- `useEffect` de fetch (`:81`) tem array `[]` vazio e chama `fetchJogos` definida dentro do componente — verificar se eslint reporta `fetchJogos` como dependência faltante. Se sim, envolver `fetchJogos` em `useCallback` com deps `[]` ou mover a definição para dentro do `useEffect`.

### Bundle / imports
- Rodar `npx next build` e verificar no output se `/` (página) tem First Load JS > 100KB. Se sim, reportar o tamanho exato.
- Verificar se `zod` é importado em `page.tsx` (não deveria — validação é só no servidor). Atualmente não está importado — confirmar.

## Limite (só reportar, não corrigir)

- Server Actions (alternativa ao fetch pattern) — propor, não implementar.
- Mudanças em Route Handlers.
- Classes CSS de layout ou acessibilidade.

## Formato de saída

```
### Mudanças aplicadas
- src/app/page.tsx:130 — faseColors movido para escopo do módulo (eliminado re-create a cada render)

### Problemas encontrados (não corrigidos)
- src/app/page.tsx:66 — fetch client-side cria waterfall; sugestão: extrair Server Component pai
```
