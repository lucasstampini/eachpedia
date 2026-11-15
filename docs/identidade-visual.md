# Identidade visual

Fonte: canvas "Eachpedia: identidade visual" (https://claude.ai/artifact/VjPKdA4VgGAZoxM8Rqgu47). Os tokens vivem em `packages/config/tailwind/tema.css`. Se o canvas mudar, atualize aquele arquivo e este documento.

## Símbolo

Touro da atlética reduzido ao mínimo: só retas, sem orelhas, sem rosto. São três polígonos num viewBox de 120. O componente é `apps/web/src/components/marca/Simbolo.tsx`.

| Versão                   | Uso                        |
| ------------------------ | -------------------------- |
| Vermelho sobre claro     | Padrão                     |
| Amarelo sobre vermelho   | Camiseta, adesivo, eventos |
| Branco sobre vermelho    | Ícone de app e avatar      |
| Vermelho sobre amarelo   | Destaques pontuais         |
| Traço (2,5 de espessura) | Usos decorativos           |

Funciona até 16 px.

## Logotipo

"eachpedia" em caixa baixa, Space Grotesk 500, espaçamento entre letras de -0.04em, cor grafite. Na versão horizontal o símbolo fica à esquerda.

## Cores

| Token          | Hex       | Uso                                                 |
| -------------- | --------- | --------------------------------------------------- |
| `vermelho`     | `#D7262E` | Símbolo e botões. Branco sobre ela dá 5,0:1         |
| `vermelho-700` | `#B81E25` | Links e hover de botão                              |
| `vermelho-800` | `#9E1A20` | Texto sobre `vermelho-50`                           |
| `vermelho-900` | `#8E151B` | Hover de link                                       |
| `vermelho-50`  | `#FBE9EA` | Fundo do chip de sigla                              |
| `amarelo`      | `#FFC400` | Destaque e fundo de peças. Nunca texto sobre branco |
| `amarelo-100`  | `#FFF3CC` | Selo "Revisado pelos curadores"                     |
| `grafite`      | `#1C1C1C` | Só para texto. Sobre branco dá 17,0:1               |
| `cinza-700`    | `#3F3F3F` | Texto secundário                                    |
| `cinza-600`    | `#525252` | Rótulos e legendas                                  |
| `cinza-300`    | `#D4D4D4` | Borda de inputs, pills e botão secundário           |
| `cinza-200`    | `#E5E5E5` | Divisórias                                          |
| `cinza-50`     | `#FAFAFA` | Fundo de input                                      |
| `fundo`        | `#F7F7F7` | Fundo da página                                     |
| `superficie`   | `#FFFFFF` | Cards                                               |

## Tipografia

| Família        | Pesos         | Uso                                                                  |
| -------------- | ------------- | -------------------------------------------------------------------- |
| Space Grotesk  | 500, 700      | Logotipo (500) e títulos (700, espaçamento de -0.03em)               |
| Inter          | 400, 500, 600 | Corpo e interface                                                    |
| JetBrains Mono | 500           | Siglas de disciplina e rótulos em caixa alta (espaçamento de 0.04em) |

## Forma

- Raios: 16 px em cards, 10 px em botões e inputs, 8 px no chip de sigla, 999 px em pills.
- Controles (botão, input) com 44 px de altura.
- Uma sombra só, leve: `0 1px 2px rgba(0,0,0,0.06)`.
- Sem degradês e sem bordas coloridas laterais.

## Tema escuro

Ainda não definido na identidade. O site só tem tema claro por enquanto.
