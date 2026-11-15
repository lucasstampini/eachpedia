import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

export type Documento = cheerio.CheerioAPI;
export type Elemento = cheerio.Cheerio<AnyNode>;

/** Erro de leitura de página. O scraper para em vez de gravar dado duvidoso. */
export class ErroDeParser extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeParser";
  }
}

export function carregar(html: string): Documento {
  return cheerio.load(html);
}

/** Junta espaços, quebras de linha e espaços duros num espaço só. */
export function limpar(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

/** Texto de um elemento preservando as quebras de linha dos <br>. */
export function textoComQuebras($: Documento, elemento: Elemento): string {
  const copia = elemento.clone();
  copia.find("br").replaceWith("\n");
  return copia
    .text()
    .replaceAll(String.fromCharCode(160), " ")
    .replace(/\r/g, "")
    .split("\n")
    .map((linha) => linha.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type Linha = {
  /** Texto limpo de cada célula da linha. */
  celulas: string[];
  elemento: Elemento;
};

/**
 * Todas as linhas de tabela "folha" (sem outra tabela dentro), na ordem do documento.
 * As páginas do JúpiterWeb são tabelas dentro de tabelas, então olhar só as folhas
 * evita ler o mesmo texto duas vezes.
 */
export function linhasFolha($: Documento): Linha[] {
  const linhas: Linha[] = [];
  $("tr").each((_, tr) => {
    const elemento = $(tr);
    if (elemento.find("tr").length > 0) return;
    const celulas = elemento
      .children("td, th")
      .toArray()
      .map((celula) => limpar($(celula).text()));
    linhas.push({ celulas, elemento });
  });
  return linhas;
}

/** Lê um inteiro de um texto como "8 semestres" ou "60 h". Vazio vira o padrão, se houver. */
export function inteiro(texto: string, contexto: string, padrao?: number): number {
  const limpo = limpar(texto);
  if (limpo === "" && padrao !== undefined) return padrao;
  const achado = /^(\d+)/.exec(limpo);
  if (!achado) throw new ErroDeParser(`Esperava um número em "${contexto}", veio "${limpo}".`);
  return Number(achado[1]);
}
