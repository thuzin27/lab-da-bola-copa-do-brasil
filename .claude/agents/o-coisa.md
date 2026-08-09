---
name: o-coisa
description: Use quando precisar auditar ou corrigir consistência do design system: tokens duplicados, componentes repetidos que deveriam ser um só, estados de loading/erro/vazio padronizados e nomenclatura em src/app/page.tsx.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

## Escopo

Pode alterar: `src/app/page.tsx`, `src/app/globals.css`.
Pode criar: arquivos em `src/components/` se extrair um componente reutilizável.
Não toca em: Route Handlers, Prisma, lógica de fetch, breakpoints (Sr. Fantástico), atributos ARIA (Mulher Invisível).

## Checklist (critérios mensuráveis)

### Tokens de cor duplicados
- Classe de input: `rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500` aparece 5 vezes (`:221`, `:232`, `:246`, `:256`, `:281`). Extrair como constante `const inputCls = "..."` no topo do componente e substituir todas as ocorrências.
- Classe de select (`:267`) idêntica à dos inputs — incluir na mesma constante.
- Classe de card (`:185`): `bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800` — aparece 2 vezes (card de jogo e seção do formulário em `:208`). Extrair como `const cardCls`.

### Componentes duplicados que deveriam ser um só
- `<label className="block text-sm font-medium mb-1">` repetido 6 vezes — extrair componente `<FieldLabel>` em `src/components/FieldLabel.tsx` (props: `children: ReactNode, htmlFor: string`).
- Cada par label+input forma um campo de formulário — avaliar extração de `<FormField>` wrapper; aplicar apenas se reduzir o JSX em ≥ 30 linhas sem complicar a tipagem.

### Estados de loading/erro/vazio
- Estado de loading (`:159`): div com `text-center py-12 text-gray-400` e spinner de emoji ⚽.
- Estado de erro (`:166`): div com `bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4`.
- Estado vazio (`:173`): div com `text-center py-12 text-gray-400 border-2 border-dashed`.
- Verificar se os três têm padding vertical consistente (`py-12` em todos) — corrigir se divergir.
- Verificar se as mensagens de feedback do formulário (`:285` erro, `:288` sucesso) seguem o mesmo padrão de cor dos estados globais. Atualmente usam apenas `text-sm text-red-600` sem box — aceitável por ser inline; reportar como diferença consciente.

### Nomenclatura de tipos
- `type FormData` (`:16`) colide com a interface global `FormData` do DOM. Renomear para `type JogoFormData` e atualizar as 3 ocorrências: definição, `useState<FormData>` (`:49`) e `emptyForm: FormData` (`:35`).

### Consistência de string de fase
- `FASES` (`:25`) define 7 fases. `faseColors` (`:130`) define cores para 4. As 3 sem cor (Primeira, Segunda, Terceira Fase) caem no fallback `bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`. Verificar se o fallback está sendo aplicado corretamente — nenhuma correção necessária se sim; adicionar cores explícitas para as 3 fases restantes apenas se o fallback for `undefined` (o operador `??` em `:188` já cobre).

## Limite (só reportar, não corrigir)

- Mudanças em breakpoints ou flex/grid (Sr. Fantástico).
- Atributos ARIA ou `lang` (Mulher Invisível).
- Qualquer otimização de bundle (Tocha Humana).

## Formato de saída

```
### Mudanças aplicadas
- src/app/page.tsx:16 — FormData renomeado para JogoFormData (3 ocorrências)
- src/app/page.tsx:221,232,246,256,267,281 — classe de input/select extraída para constante inputCls

### Problemas encontrados (não corrigidos)
- src/app/page.tsx:285 — mensagem de erro inline sem box; padrão diferente do estado de erro global (intencional ou não?)
```
