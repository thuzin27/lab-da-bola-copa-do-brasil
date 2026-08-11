# 07 — BUG: header com nome duplicado e logo estourando

**Encontrado por:** Arthur, olhando a tela — não por vilão
**Corrige:** `sr-fantastico` (Quarteto)
**Revalida:** `arlequina`

## Bug 1 — "Lab da Bola" aparece duas vezes

```
public/lab-da-bola.svg   -> tem o texto "Lab da Bola" desenhado dentro
App.tsx (linha ~119)     -> renderiza esse SVG
App.tsx (logo abaixo)    -> escreve "Lab da Bola" outra vez, em texto
```

Resultado: o nome aparece duplicado lado a lado no header.

**Origem:** duas especificações que se somaram. O SVG foi pedido como "bola
estilizada **com o texto** Lab da Bola"; depois a `tasks/01` pediu
"Lab da Bola à esquerda" como texto. Nenhuma das duas estava errada
isoladamente.

**Correção recomendada:** tirar o texto de dentro do SVG, deixando só o
símbolo, e manter o nome como texto HTML. Texto real é selecionável,
acessível, escala com a fonte do usuário e não vira imagem borrada. O
contrário — apagar o texto e deixar só o SVG — piora acessibilidade e SEO.

O `<img>` já está com `alt=""` e `aria-hidden="true"`, o que fica correto
assim que ele virar puramente decorativo.

## Bug 2 — logo da Copa estourando a área

Na largura testada, a logo da Copa do Brasil aparece cortada na direita
("BRASIL" incompleto). O `CopaDoBrasilLogo` usa `height: 40` com
`width: 'auto'` — sem `max-width`, uma imagem larga vaza o container.

Adicionar limite de largura e garantir que o header não gere overflow em
nenhuma resolução.

## Critérios de aceite

- [ ] "Lab da Bola" aparece **uma única vez** no header
- [ ] Logo da Copa inteira e visível, sem corte
- [ ] Sem overflow horizontal de 320px a 3440px
- [ ] Símbolo e texto alinhados verticalmente
- [ ] Se qualquer das imagens falhar, o header não colapsa
- [ ] Contraste AA mantido

## Por que nenhum vilão pegou isso

A Arlequina só tem `Read`, `Grep`, `Glob` e `Bash` — ela **não via a tela**.
Nome duplicado e imagem cortada não aparecem em `grep`.

O agente já foi corrigido: agora é obrigatório rodar `screenshot.mjs` em
320px, 768px e 1440px e **abrir os prints com a ferramenta Read** antes de
qualquer veredito. Veredito sem print passou a ser inválido.
