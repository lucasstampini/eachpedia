# Arquitetura

Este documento cresce junto com o projeto. Hoje descreve a fundação (Fase 0).

## Visão geral

```
JúpiterWeb (páginas públicas)
        |
        v
packages/scraper  --->  Supabase (Postgres + Auth + RLS)  <---  apps/web (Next.js)
        |                                                          |
        +------------------>  packages/core  <---------------------+
                              (domínio puro)                apps/extension (WXT)
```

- **`packages/core`**: tipos, schemas Zod e algoritmos de domínio (grafo, planejador, montador, parser do histórico). Puro: sem I/O, sem React, sem Supabase. Tudo com teste.
- **`packages/scraper`**: coleta as páginas públicas do JúpiterWeb, valida com Zod e grava no banco com a service role.
- **`packages/db`**: tipos gerados do Supabase e helpers de acesso.
- **`packages/config`**: tsconfig, ESLint e tema Tailwind compartilhados.
- **`apps/web`**: o site, em Next.js (App Router).
- **`apps/extension`**: extensão de navegador (entra na Fase 9).
- **`supabase/`**: migrations SQL (fonte da verdade do schema) e seed.

## Decisões

- **Útil sem login.** Grafo, planejador, montador e wiki são públicos. Login só para contribuir.
- **Privacidade por padrão.** O estado do planejador fica no navegador. O PDF do histórico nunca sai dele.
- **RLS em todas as tabelas.** A primeira migration instala um gatilho que liga RLS em toda tabela nova do schema `public`.
- **Código simples.** O projeto vai ser mantido por outras turmas. Prefira o óbvio ao esperto.

## Identidade visual

Veja `docs/identidade-visual.md`. Os tokens ficam em `packages/config/tailwind/tema.css`.
