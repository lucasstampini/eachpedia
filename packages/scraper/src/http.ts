import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { INTERVALO_MINIMO_MS, URL_JUPITERWEB, USER_AGENT } from "./config.ts";

const TENTATIVAS = 4;

export type OpcoesDoCliente = {
  /** Pasta do cache de páginas brutas. Sem ela, não há cache. */
  pastaDoCache?: string;
  /** Intervalo mínimo entre requisições. Nunca menor que 1 segundo. */
  intervaloMs?: number;
  /** Trocável nos testes. */
  fetchImpl?: typeof fetch;
  esperar?: (ms: number) => Promise<void>;
};

export type Cliente = {
  /** Busca uma página pública do JúpiterWeb, ex.: "obterDisciplina?sgldis=ACH2036". */
  buscar: (caminho: string) => Promise<string>;
  /** Quantas requisições de rede foram feitas (cache não conta). */
  requisicoes: () => number;
};

const esperarDeVerdade = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Nome de arquivo seguro para guardar a página no cache. */
function arquivoDoCache(caminho: string): string {
  return `${caminho.replace(/[^A-Za-z0-9=&._-]+/g, "_")}.html`;
}

/** As páginas do JúpiterWeb vêm em ISO-8859-1. Respeita o charset do cabeçalho se vier outro. */
function decodificar(bytes: ArrayBuffer, contentType: string | null): string {
  const charset = /charset=([\w-]+)/i.exec(contentType ?? "")?.[1] ?? "iso-8859-1";
  return new TextDecoder(charset).decode(bytes);
}

/**
 * Cliente HTTP do scraper: no máximo 1 requisição por segundo, novas tentativas
 * com espera crescente, User-Agent do projeto e cache local opcional.
 */
export function criarCliente(opcoes: OpcoesDoCliente = {}): Cliente {
  const intervalo = Math.max(opcoes.intervaloMs ?? INTERVALO_MINIMO_MS, INTERVALO_MINIMO_MS);
  const fetchImpl = opcoes.fetchImpl ?? fetch;
  const esperar = opcoes.esperar ?? esperarDeVerdade;
  let ultima = 0;
  let total = 0;

  async function baixar(caminho: string): Promise<string> {
    let ultimoErro: unknown;
    for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
      const falta = ultima + intervalo - Date.now();
      if (falta > 0) await esperar(falta);
      ultima = Date.now();
      total++;

      try {
        const resposta = await fetchImpl(`${URL_JUPITERWEB}/${caminho}`, {
          headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
          signal: AbortSignal.timeout(30_000),
        });
        if (resposta.ok) {
          return decodificar(await resposta.arrayBuffer(), resposta.headers.get("content-type"));
        }
        ultimoErro = new Error(`HTTP ${resposta.status}`);
        // Erro do nosso lado (4xx) não melhora tentando de novo, exceto 429.
        if (resposta.status < 500 && resposta.status !== 429) break;
      } catch (erro) {
        ultimoErro = erro;
      }
      if (tentativa < TENTATIVAS) await esperar(2000 * 2 ** (tentativa - 1));
    }
    throw new Error(`Não consegui baixar "${caminho}".`, { cause: ultimoErro });
  }

  return {
    requisicoes: () => total,
    async buscar(caminho) {
      const arquivo = opcoes.pastaDoCache
        ? path.join(opcoes.pastaDoCache, arquivoDoCache(caminho))
        : null;

      if (arquivo) {
        try {
          return await readFile(arquivo, "utf8");
        } catch {
          // Ainda não está no cache. Segue para a rede.
        }
      }

      const html = await baixar(caminho);
      if (arquivo) {
        await mkdir(path.dirname(arquivo), { recursive: true });
        await writeFile(arquivo, html, "utf8");
      }
      return html;
    },
  };
}
