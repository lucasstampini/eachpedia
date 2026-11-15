import {
  dadosOficiaisSchema,
  type Curriculo,
  type DadosOficiais,
  type Disciplina,
} from "@eachpedia/core";

import { CODIGO_UNIDADE_EACH } from "./config.ts";
import type { Cliente } from "./http.ts";
import { parseListaDeCursos } from "./parsers/cursos.ts";
import { parseDisciplina } from "./parsers/disciplina.ts";
import { parseGradeCurricular } from "./parsers/grade.ts";

export type OpcoesDeColeta = {
  /** Coleta só estes códigos de curso. Útil para testar sem baixar tudo. */
  apenasCursos?: number[];
  avisar?: (mensagem: string) => void;
};

/**
 * Coleta cursos, currículos, disciplinas e requisitos de todos os cursos da EACH.
 * O resultado passa pelo schema Zod. Se algo não bater, lança erro e nada é gravado.
 */
export async function coletar(
  cliente: Cliente,
  opcoes: OpcoesDeColeta = {},
): Promise<DadosOficiais> {
  const avisar = opcoes.avisar ?? (() => {});
  const unidade = CODIGO_UNIDADE_EACH;

  const lista = parseListaDeCursos(
    await cliente.buscar(`jupCursoLista?codcg=${unidade}&tipo=N`),
    unidade,
  );
  const cursos = opcoes.apenasCursos
    ? lista.filter((curso) => opcoes.apenasCursos?.includes(curso.codigo))
    : lista;
  avisar(`${cursos.length} cursos e habilitações para coletar.`);

  const curriculos: Curriculo[] = [];
  for (const curso of cursos) {
    avisar(`Grade: ${curso.nome} (${curso.periodo})`);
    const html = await cliente.buscar(
      `listarGradeCurricular?codcg=${unidade}&codcur=${curso.codigo}&codhab=${curso.habilitacao}&tipo=N`,
    );
    curriculos.push(parseGradeCurricular(html, curso));
  }

  // Toda sigla citada em alguma grade, como disciplina ou como requisito.
  const siglas = new Set<string>();
  for (const curriculo of curriculos) {
    for (const disciplina of curriculo.disciplinas) siglas.add(disciplina.sigla);
    for (const requisito of curriculo.requisitos) siglas.add(requisito.sigla_requisito);
  }

  const disciplinas: Disciplina[] = [];
  const ordenadas = [...siglas].sort();
  for (const [indice, sigla] of ordenadas.entries()) {
    if (indice % 25 === 0) avisar(`Disciplinas: ${indice} de ${ordenadas.length}`);
    const disciplina = parseDisciplina(await cliente.buscar(`obterDisciplina?sgldis=${sigla}`));
    if (disciplina.sigla !== sigla) {
      throw new Error(`Pedi a disciplina ${sigla} e a página devolveu ${disciplina.sigla}.`);
    }
    disciplinas.push(disciplina);
  }

  return dadosOficiaisSchema.parse({ cursos, curriculos, disciplinas });
}
