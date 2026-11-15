# Eachpedia

Plataforma aberta e comunitária para os alunos da EACH-USP, cobrindo todos os cursos da unidade. A ideia é ser o repositório vivo de tudo que um aluno da EACH precisa saber, mantido pelas próximas turmas.

## O que tem (e o que vai ter)

- **Grafo de pré-requisitos** de cada curso.
- **Quanto falta pra formar**: marque o que já cursou e veja o que falta, com um plano sugerido.
- **Montador de grade**: combina turmas sem choque de horário.
- **Wiki** com roadmaps e guias por curso e disciplina, editável por qualquer aluno.
- **Mural de ICs** com vagas que expiram sozinhas.
- **Avaliação de disciplinas e professores**, anônima e moderada.
- **Extensão de navegador** para o JúpiterWeb.
- **Dados abertos**: tudo que é público pode ser exportado.

O projeto está no começo. O andamento por fase fica em `docs/plans/`.

## Rodando localmente

Você precisa de Node 22 ou mais novo, pnpm e Docker (para o banco local).

```bash
pnpm install
cp .env.example .env.local   # preencha com os valores que o supabase start mostrar
pnpm supabase start          # sobe o banco local
pnpm dev                     # sobe o site em http://localhost:3000
```

Outros comandos:

```bash
pnpm test                    # testes unitários
pnpm lint && pnpm typecheck  # checagens de código
pnpm format                  # formata tudo com Prettier
pnpm supabase db reset       # recria o banco local com migrations e seed
```

## Estrutura

```
apps/web          site (Next.js)
packages/core     regras de domínio puras e testadas
packages/scraper  coleta dos dados públicos do JúpiterWeb
packages/db       tipos e acesso ao banco
packages/config   configurações compartilhadas e tema visual
supabase/         migrations e seed
docs/             arquitetura, glossário, identidade visual e planos
```

Mais detalhes em [docs/arquitetura.md](docs/arquitetura.md).

## Como contribuir

Conteúdo (wiki, roadmaps, vagas de IC) se edita pelo próprio site, sem precisar de GitHub. Para contribuir com código, leia o [CONTRIBUTING.md](CONTRIBUTING.md).

## Licenças

- Código: [MIT](LICENSE).
- Conteúdo da wiki e dados exportados: [CC BY-SA 4.0](LICENSE-CONTENT).

O Eachpedia é um projeto de alunos. Não é um sistema oficial da USP.
