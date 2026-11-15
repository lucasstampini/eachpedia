import type { Disciplina, Docente } from "@eachpedia/core";

import {
  carregar,
  ErroDeParser,
  inteiro,
  limpar,
  linhasFolha,
  textoComQuebras,
  type Documento,
} from "./html.ts";

/** Texto da seção que vem logo abaixo de um título em negrito (Ementa, Objetivos, ...). */
function secao($: Documento, titulo: RegExp): string {
  const negrito = $("b")
    .toArray()
    .find((b) => titulo.test(limpar($(b).text())));
  if (!negrito) return "";
  const conteudo = $(negrito).closest("tr").next("tr").children("td").first();
  return textoComQuebras($, conteudo);
}

/** Lê a página pública de uma disciplina (obterDisciplina). */
export function parseDisciplina(html: string): Disciplina {
  const $ = carregar(html);
  const linhas = linhasFolha($);

  const titulo = linhas
    .map(({ celulas }) => /^Disciplina:\s*([A-Z0-9]{7})\s*-\s*(.+)$/.exec(celulas[0] ?? ""))
    .find((achado) => achado !== null);
  if (!titulo?.[1] || !titulo[2]) {
    throw new ErroDeParser("Não encontrei sigla e nome na página da disciplina.");
  }
  const sigla = titulo[1];

  const numero = (rotulo: RegExp, nome: string): number => {
    const linha = linhas.find(({ celulas }) => rotulo.test(celulas[0] ?? ""));
    if (!linha) throw new ErroDeParser(`Não encontrei "${nome}" na disciplina ${sigla}.`);
    return inteiro(linha.celulas[1] ?? "", `${nome} de ${sigla}`, 0);
  };

  // Docentes aparecem como "87769 - Nome Completo", depois do título "Docente(s) Responsável(eis)".
  const docentes: Docente[] = [];
  const inicioDocentes = linhas.findIndex(({ celulas }) => /^Docente\(s\)/i.test(celulas[0] ?? ""));
  if (inicioDocentes >= 0) {
    for (const { celulas } of linhas.slice(inicioDocentes + 1)) {
      const achado = /^(\d+)\s*-\s*(.+)$/.exec(celulas.filter((c) => c !== "").join(" "));
      if (!achado?.[1] || !achado[2]) continue;
      const numero_usp = Number(achado[1]);
      if (!docentes.some((d) => d.numero_usp === numero_usp)) {
        docentes.push({ numero_usp, nome: achado[2] });
      }
    }
  }

  return {
    sigla,
    nome: titulo[2],
    creditos_aula: numero(/^Créditos Aula:?$/i, "créditos aula"),
    creditos_trabalho: numero(/^Créditos Trabalho:?$/i, "créditos trabalho"),
    carga_horaria: numero(/^Carga Horária Total:?$/i, "carga horária total"),
    ementa: secao($, /^Ementa$/i),
    objetivos: secao($, /^Objetivos$/i),
    programa: secao($, /^Conteúdo Programático$/i),
    docentes,
  };
}
