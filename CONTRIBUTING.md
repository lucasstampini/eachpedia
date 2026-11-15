# Como contribuir

Obrigado por querer ajudar. Tem dois jeitos de contribuir, e só um deles pede conhecimento de programação.

## Conteúdo (não precisa saber programar)

Wiki, roadmaps, guias e vagas de IC são editados dentro do próprio site. Você entra com seu e-mail `@usp.br`, sugere a edição e um curador do seu curso aprova. Não precisa de conta no GitHub.

## Código

1. Abra uma issue descrevendo o que quer fazer, ou escolha uma que já exista.
2. Crie um branch a partir de `main`.
3. Rode o projeto (veja o [README](README.md)).
4. Antes de abrir o PR, rode:

   ```bash
   pnpm lint && pnpm typecheck && pnpm test
   ```

5. Abra o PR explicando o que mudou e por quê. O CI precisa passar.

### Convenções

- **TypeScript strict** em tudo.
- **Commits** pequenos, em português, no formato Conventional Commits. Exemplo: `feat(scraper): coleta requisitos por curriculo`.
- **Nomes de domínio em português** (`curso`, `disciplina`, `requisito`). Código técnico em inglês. Veja o [glossário](docs/glossario.md).
- **Texto da interface** em português do Brasil, direto e amigável. Não use travessão em nenhum texto.
- **Algoritmos de domínio** ficam em `packages/core`, puros (sem I/O, sem React, sem Supabase) e com testes.
- **Banco**: toda mudança de schema é uma migration nova em `supabase/migrations`. Toda tabela tem RLS ligado e teste de RLS.
- **Segredos** nunca entram no repositório. Use `.env.local` e documente a variável em `.env.example`.
- **Visual**: use os tokens de `docs/identidade-visual.md`. Não invente cor nova.

### O que não fazer

- Não acesse áreas autenticadas do JúpiterWeb nem de nenhum sistema da USP. O scraper só lê páginas públicas.
- Não commite histórico escolar real de ninguém, nem dado pessoal.

## Conduta

Ao participar, você concorda com o [Código de Conduta](CODE_OF_CONDUCT.md).
