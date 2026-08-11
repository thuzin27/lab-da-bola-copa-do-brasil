# 02 — Estrutura de abas e repaginada profissional

**Valida:** arlequina + pistoleiro

## Objetivo

Criar a navegação por **abas** e dar um acabamento profissional à tela,
mantendo o tema escuro.

Abas: **Chaveamento** | **Fases anteriores** | **Simulação**

Nesta tarefa só o **Chaveamento** fica populado. As outras duas ficam com a
casca pronta e são preenchidas nas tarefas 03 e 04.

## Arquivos afetados

- `src/app/page.tsx` (479 linhas, tudo num arquivo)
- `src/app/globals.css`
- Criar `src/components/` — hoje não existe

## Trabalho

**Estrutura**

Quebrar a `page.tsx`. Ela concentra hoje: `deriveConfrontos`, `Escudo`,
`MatchCard`, `EmptySlot`, `BracketConnectors`, `BracketDesktop`,
`BracketMobile`, `FasesAnteriores`, `AdminForm` e `Home`. Extrair para
`src/components/`.

**Abas acessíveis de verdade**

- `role="tablist"` / `role="tab"` / `role="tabpanel"` / `aria-selected`
- Navegação por setas do teclado entre abas
- Foco visível
- Aba ativa refletida na URL (`?aba=chaveamento`), para recarregar e voltar
  funcionarem

**Acabamento**

- Hierarquia: o placar domina, a data é secundária
- Espaçamento consistente — definir escala e usar em tudo
- Tipografia: no máximo dois pesos, tamanhos numa escala clara
- Resolver o vão morto entre as colunas em tela larga
- Escudos dos times aparecendo (os dados já estão no banco)

## Critérios de aceite

- [ ] Três abas navegáveis por mouse e por teclado
- [ ] `role="tablist"`, `role="tab"`, `aria-selected` presentes
- [ ] Aba ativa na URL; recarregar mantém, botão voltar funciona
- [ ] Chaveamento populado; as outras duas com casca visível, sem erro
- [ ] `src/components/` criado, `page.tsx` bem menor
- [ ] Sem scroll horizontal de 320px a 3440px
- [ ] Tema escuro coerente, contraste AA

## Fora de escopo

Conteúdo das abas "Fases anteriores" (tarefa 03) e "Simulação" (tarefa 04).
