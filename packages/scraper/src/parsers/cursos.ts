import { periodoSchema, type Curso } from "@eachpedia/core";

import { carregar, ErroDeParser, limpar } from "./html.ts";

const SUFIXO_CICLO_BASICO = /\s*-\s*Ciclo Básico$/i;

/**
 * Lê a lista de cursos e habilitações de uma unidade (jupCursoLista).
 *
 * As entradas "Ciclo Básico" ficam de fora: são só o começo do curso, e a grade
 * da habilitação completa já inclui essas disciplinas.
 */
export function parseListaDeCursos(html: string, unidade: number): Curso[] {
  const $ = carregar(html);
  const cursos: Curso[] = [];

  $("a[href*='listarGradeCurricular']").each((_, link) => {
    const elemento = $(link);
    const nome = limpar(elemento.text());
    if (SUFIXO_CICLO_BASICO.test(nome)) return;

    const parametros = new URLSearchParams((elemento.attr("href") ?? "").split("?")[1] ?? "");
    const codigo = Number(parametros.get("codcur"));
    const habilitacao = Number(parametros.get("codhab"));
    if (!codigo || !habilitacao) {
      throw new ErroDeParser(`Link de grade sem codcur ou codhab no curso "${nome}".`);
    }

    const periodo = periodoSchema.safeParse(limpar(elemento.closest("td").next("td").text()));
    if (!periodo.success) {
      throw new ErroDeParser(`Período desconhecido no curso "${nome}".`);
    }

    cursos.push({ codigo, habilitacao, nome, periodo: periodo.data, unidade });
  });

  if (cursos.length === 0) {
    throw new ErroDeParser("Nenhum curso encontrado na lista. A página mudou?");
  }
  return cursos;
}
