# 01 — Logo da Copa do Brasil no header

**Valida:** arlequina

## Objetivo

Header com **"Lab da Bola" à esquerda** e a **logo oficial da Copa do Brasil à
direita**, alinhados e responsivos.

## Arquivos afetados

- `src/app/page.tsx` (header está inline na página)
- `public/` (arquivo da logo)
- `src/lib/competicao.ts` (já tem as URLs da TheSportsDB)

## Situação da logo

Arthur vai fornecer o arquivo em `/public`. Se ainda não estiver lá:

1. **Deixe o slot pronto** — componente do header já posicionando a imagem
2. Use como fallback a URL que já existe em `src/lib/competicao.ts`:
   `https://r2.thesportsdb.com/images/media/league/logo/opmpxf1700175452.png`
3. **Avise o Arthur** de qual caminho e nome de arquivo o código espera

O domínio `r2.thesportsdb.com` já está em `images.remotePatterns` no
`next.config`. Se a logo passar a ser local, o `remotePatterns` continua
necessário para os escudos dos times.

## Critérios de aceite

- [ ] "Lab da Bola" à esquerda, logo da Copa à direita, na mesma linha
- [ ] Alinhamento vertical correto entre texto e imagem
- [ ] Em 320px o header não quebra nem gera scroll horizontal
- [ ] Logo com `alt` descritivo ("Copa do Brasil 2026")
- [ ] Se a imagem falhar ao carregar, o header não colapsa nem mostra ícone quebrado
- [ ] Cabeçalho verde saturado revisto — tema escuro coerente com o resto
- [ ] Contraste AA entre texto e fundo do header

## Fora de escopo

Não mexer no conteúdo abaixo do header. As abas são a tarefa 02.
