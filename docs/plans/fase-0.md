# Fase 0: Fundação

## Objetivo

Deixar o repositório pronto para receber as próximas fases: monorepo funcionando, site no ar em modo dev já com a identidade visual, banco local, CI e documentos de base.

## Passos

1. Git, `.gitignore`, `.editorconfig`, `.nvmrc`.
2. Monorepo com pnpm workspaces e Turborepo. Scripts na raiz: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `scrape`, `format`.
3. `packages/config`: tsconfig base (strict), ESLint (flat config), tema Tailwind com os tokens da identidade visual.
4. `packages/core`, `packages/db`, `packages/scraper`: esqueletos com Vitest e um teste de fumaça.
5. `apps/web`: Next.js (App Router), Tailwind, shadcn/ui tematizado, fontes, símbolo e logo, header, footer e home.
6. `supabase/`: config, primeira migration (sem tabelas, com gatilho que liga RLS em toda tabela nova de `public`) e `seed.sql`.
7. CI no GitHub Actions: lint, typecheck e testes em todo PR.
8. Documentos: README, CONTRIBUTING, CODE_OF_CONDUCT, GOVERNANCE (esqueleto), LICENSE, LICENSE-CONTENT, `.env.example`, glossário, arquitetura e identidade visual.

## Decisões

- **Tailwind v4**: o tema é um arquivo CSS (`packages/config/tailwind/tema.css`) com `@theme`, importado pelo web e depois pela extensão. É a fonte única dos tokens.
- **shadcn/ui**: componentes copiados para `apps/web/src/components/ui`, com as variáveis do shadcn apontando para os tokens da marca.
- **Só tema claro** por enquanto. A identidade visual ainda não define tema escuro.
- **Supabase CLI** entra como devDependency na raiz, para ninguém precisar instalar nada global.
- **RLS por padrão**: um event trigger do Postgres liga RLS em qualquer tabela criada em `public`. Assim esquecer o `enable row level security` numa migration não abre a tabela.

## Definição de Pronto

- `pnpm install && pnpm dev` sobe o site.
- `pnpm lint && pnpm typecheck && pnpm test` passam.
- CI passa num PR de teste (depende de o repositório existir na organização do GitHub).
