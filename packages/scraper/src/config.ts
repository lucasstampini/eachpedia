/**
 * Por enquanto o repositório fica numa conta pessoal. Quando migrar para a
 * organização, troque aqui e no rodapé do site (Footer.tsx).
 */
/** Endereço do repositório, usado para o JúpiterWeb saber quem está pedindo as páginas. */
export const URL_REPOSITORIO = "https://github.com/lucasstampini/eachpedia";

/** Identificação enviada em toda requisição. */
export const USER_AGENT = `EachpediaBot/0.1 (+${URL_REPOSITORIO})`;

/** Base das páginas públicas do JúpiterWeb. Só páginas públicas, nunca áreas autenticadas. */
export const URL_JUPITERWEB = "https://uspdigital.usp.br/jupiterweb";

/** Intervalo mínimo entre requisições: no máximo 1 por segundo. */
export const INTERVALO_MINIMO_MS = 1000;
