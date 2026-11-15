# Fase 1: Dados oficiais

## Objetivo

Ter no banco todos os cursos da EACH com grade e requisitos, coletados das páginas públicas do JúpiterWeb, de forma que rodar o scraper duas vezes seguidas não gere mudanças.

## O que a investigação mostrou

Todas as páginas são públicas, em ISO-8859-1, sob `https://uspdigital.usp.br/jupiterweb/`.

| Página           | Endereço                                                            | O que traz                                                                                                                         |
| ---------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Lista de cursos  | `jupCursoLista?codcg=86&tipo=N`                                     | Cursos, habilitações e período. A EACH é a unidade `86`                                                                            |
| Grade curricular | `listarGradeCurricular?codcg=86&codcur=<curso>&codhab=<hab>&tipo=N` | Data de início, duração, carga horária por tipo, disciplinas por semestre ideal e **os requisitos de cada disciplina, com o tipo** |
| Disciplina       | `obterDisciplina?sgldis=<sigla>`                                    | Nome, créditos, ementa, objetivos, programa e docentes responsáveis                                                                |

Pontos de atenção:

- A lista traz 32 entradas. Metade é "Ciclo Básico" (habilitações `1xx`), que é só o começo do curso. A grade da habilitação completa (`2xx`) já inclui essas disciplinas, então **coletamos só as 16 habilitações completas** (11 cursos, alguns em dois períodos).
- A página da grade mostra só o currículo mais recente. Currículos anteriores ficam para depois.
- Tipos de requisito na página: "Requisito" (forte), "Requisito fraco" e "Indicação de Conjunto".
- Algumas disciplinas têm requisitos alternativos: uma linha "ou" separa grupos. Guardamos o número do grupo em cada requisito. No mesmo grupo todos são exigidos juntos, e basta cumprir um grupo inteiro.
- As páginas dizem ISO-8859-1, mas trazem caracteres do Windows-1252 (como o traço curto). O decodificador do Node trata os dois do mesmo jeito.
- O JúpiterWeb não dá blocos de optativas com nome. Ele dá a carga horária mínima de optativas eletivas e livres. Criamos um bloco por tipo, com os créditos calculados (15 h por crédito aula, 30 h por crédito trabalho).
- Não é preciso chamar `listarCursosRequisitos`: a grade já resolve.

## Passos

1. Schemas Zod em `packages/core/src/dados-oficiais.ts`.
2. Migration com as tabelas da seção 7.1, RLS e leitura pública.
3. Scraper:
   - `http.ts`: no máximo 1 requisição por segundo, retries com backoff, User-Agent do projeto, decodificação ISO-8859-1 e cache local em disco.
   - `parsers/`: um parser por página, só HTML para objeto, sem rede.
   - `coletar.ts`: junta tudo num conjunto de dados validado, com `content_hash` por entidade.
   - `gravar.ts`: compara hashes com o banco e grava só o que mudou. Registra `scraper_runs` com o resumo.
4. Fixtures HTML reais e testes dos parsers.
5. Workflow agendado no GitHub Actions.

## Decisões

- **Falha alto**: se o parser encontrar uma linha que não entende ou o Zod recusar o resultado, o scraper para sem gravar nada.
- **Nunca apaga dado oficial sozinho**: disciplina que some do JúpiterWeb continua no banco. Só os vínculos de um currículo (disciplinas e requisitos) são trocados quando o currículo muda.
- **Idempotência por hash**: entidade com o mesmo `content_hash` não é regravada.

## Definição de Pronto

- O banco tem todos os cursos da EACH com grade e requisitos.
- Rodar o scraper duas vezes seguidas: a segunda execução registra zero mudanças.
