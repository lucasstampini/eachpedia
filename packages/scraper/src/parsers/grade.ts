import type {
  CargaHoraria,
  Curriculo,
  CurriculoDisciplina,
  Requisito,
  TipoDisciplina,
  TipoRequisito,
} from "@eachpedia/core";

import { carregar, ErroDeParser, inteiro, limpar, linhasFolha, type Linha } from "./html.ts";

const SEM_CARGA: CargaHoraria = { aula: 0, trabalho: 0 };

/** Cabeçalhos de seção da tabela de disciplinas. */
function tipoDaSecao(texto: string): TipoDisciplina | null {
  if (texto.length > 60) return null;
  if (/^Disciplinas Obrigatórias$/i.test(texto)) return "obrigatoria";
  if (/^Disciplinas Optativas Eletivas$/i.test(texto)) return "optativa_eletiva";
  if (/^Disciplinas Optativas Livres$/i.test(texto)) return "optativa_livre";
  return null;
}

function tipoDoRequisito(texto: string): TipoRequisito | null {
  if (/^Requisito$/i.test(texto)) return "forte";
  if (/^Requisito fraco$/i.test(texto)) return "fraco";
  if (/^Indicação de Conjunto$/i.test(texto)) return "indicacao_conjunto";
  return null;
}

/** Valor da célula que vem logo depois de uma célula com o rótulo dado. */
function valorDepoisDe(linhas: Linha[], rotulo: RegExp): string | null {
  for (const { celulas } of linhas) {
    const indice = celulas.findIndex((celula) => rotulo.test(celula));
    const valor = indice >= 0 ? celulas[indice + 1] : undefined;
    if (valor) return valor;
  }
  return null;
}

function obrigatorio(valor: string | null, oQue: string): string {
  if (valor === null) throw new ErroDeParser(`Não encontrei "${oQue}" na grade.`);
  return valor;
}

/** Linha da tabela de carga horária: rótulo, aula, trabalho, subtotal. */
function cargaDe(linhas: Linha[], rotulo: RegExp): CargaHoraria {
  for (const { celulas } of linhas) {
    const preenchidas = celulas.filter((celula) => celula !== "");
    const [nome, aula, trabalho] = preenchidas;
    if (nome && rotulo.test(nome) && aula !== undefined && trabalho !== undefined) {
      return { aula: inteiro(aula, nome), trabalho: inteiro(trabalho, nome) };
    }
  }
  return SEM_CARGA;
}

function dataIso(texto: string): string {
  const achado = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!achado) throw new ErroDeParser(`Data de início em formato inesperado: "${texto}".`);
  return `${achado[3]}-${achado[2]}-${achado[1]}`;
}

/**
 * Lê a página de grade curricular (listarGradeCurricular) de um curso e habilitação.
 * A página traz o currículo mais recente, com as disciplinas por semestre ideal
 * e os requisitos de cada uma logo abaixo dela.
 */
export function parseGradeCurricular(
  html: string,
  curso: { codigo: number; habilitacao: number },
): Curriculo {
  const $ = carregar(html);
  const linhas = linhasFolha($);
  const linhasDaCarga = linhasFolha($).filter(
    (linha) => linha.elemento.closest("#tabelaCargaHoraria").length > 0,
  );

  const textoDaCarga = limpar($("#tabelaCargaHoraria").text());
  const estagio = /\(Estágio:\s*(\d+)\)/i.exec(textoDaCarga);
  const extensao = valorDepoisDe(linhasDaCarga, /carga horária exigida em extensão/i);

  const disciplinas: CurriculoDisciplina[] = [];
  const requisitos: Requisito[] = [];
  const jaVistas = new Set<string>();
  let tipo: TipoDisciplina | null = null;
  let semestre: number | null = null;
  let atual: string | null = null;
  // Grupo de alternativas da disciplina atual. Uma linha "ou" abre o próximo grupo.
  let grupo = 1;

  for (const { celulas, elemento } of linhas) {
    const primeira = celulas[0] ?? "";

    const secao = celulas.length === 1 ? tipoDaSecao(primeira) : null;
    if (secao) {
      tipo = secao;
      semestre = null;
      atual = null;
      continue;
    }

    const periodo = /^(\d+)º Período Ideal$/i.exec(primeira);
    if (periodo) {
      semestre = Number(periodo[1]);
      atual = null;
      continue;
    }

    // Linha de disciplina: sigla com link, nome, créditos aula, créditos trabalho, ...
    if (elemento.find("a[href*='obterDisciplina']").length > 0) {
      const [sigla, nome, aula, trabalho] = celulas;
      if (!sigla || !nome || tipo === null || semestre === null) {
        throw new ErroDeParser(
          `Linha de disciplina fora de lugar na grade: "${celulas.join(" | ")}".`,
        );
      }
      atual = sigla;
      grupo = 1;
      // Uma disciplina pode aparecer mais de uma vez na página. Vale a primeira.
      if (jaVistas.has(sigla)) continue;
      jaVistas.add(sigla);
      disciplinas.push({
        sigla,
        nome,
        tipo,
        semestre_ideal: semestre,
        creditos_aula: inteiro(aula ?? "", `créditos aula de ${sigla}`),
        creditos_trabalho: inteiro(trabalho ?? "", `créditos trabalho de ${sigla}`),
      });
      continue;
    }

    // Linha de requisito: "ACH2001 - Nome" numa célula e o tipo na outra, em vermelho.
    // Só vale dentro da tabela de disciplinas (depois do primeiro cabeçalho de seção).
    if (tipo !== null && elemento.find(".txt_arial_8pt_red, .txt_verdana_8pt_red").length > 0) {
      if (/^ou$/i.test(primeira) && atual) {
        grupo++;
        continue;
      }
      const sigla = /^([A-Z0-9]{7})\b/.exec(primeira)?.[1];
      const tipoRequisito = tipoDoRequisito(celulas[1] ?? "");
      if (!sigla || !tipoRequisito || !atual) {
        // Não sabemos ler esta linha. Melhor parar do que gravar requisito errado.
        throw new ErroDeParser(`Linha de requisito que não sei ler: "${celulas.join(" | ")}".`);
      }
      const repetido = requisitos.some(
        (r) =>
          r.sigla === atual &&
          r.sigla_requisito === sigla &&
          r.tipo === tipoRequisito &&
          r.grupo === grupo,
      );
      if (!repetido)
        requisitos.push({ sigla: atual, sigla_requisito: sigla, tipo: tipoRequisito, grupo });
    }
  }

  if (disciplinas.length === 0) {
    throw new ErroDeParser(
      `Nenhuma disciplina na grade do curso ${curso.codigo}/${curso.habilitacao}.`,
    );
  }

  const duracao = (rotulo: RegExp, nome: string) =>
    inteiro(obrigatorio(valorDepoisDe(linhas, rotulo), nome), nome);

  return {
    codigo_curso: curso.codigo,
    habilitacao: curso.habilitacao,
    data_inicio: dataIso(
      obrigatorio(valorDepoisDe(linhas, /^Data de Início:?$/i), "Data de Início"),
    ),
    duracao_ideal: duracao(/^Ideal$/i, "duração ideal"),
    duracao_minima: duracao(/^Mínima$/i, "duração mínima"),
    duracao_maxima: duracao(/^Máxima$/i, "duração máxima"),
    carga_obrigatoria: cargaDe(linhasDaCarga, /^Obrigatória$/i),
    carga_optativa_eletiva: cargaDe(linhasDaCarga, /^Optativa Eletiva$/i),
    carga_optativa_livre: cargaDe(linhasDaCarga, /^Optativa Livre$/i),
    carga_estagio: estagio ? Number(estagio[1]) : null,
    carga_extensao: extensao ? inteiro(extensao, "carga de extensão") : null,
    disciplinas,
    requisitos,
  };
}
