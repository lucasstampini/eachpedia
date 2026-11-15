import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { curriculoSchema, cursoSchema, disciplinaSchema } from "@eachpedia/core";
import { describe, expect, it } from "vitest";

import { parseListaDeCursos } from "./cursos.ts";
import { parseDisciplina } from "./disciplina.ts";
import { parseGradeCurricular } from "./grade.ts";
import { ErroDeParser } from "./html.ts";

const pastaDasFixtures = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../fixtures",
);

/** As fixtures são as páginas como o JúpiterWeb entrega: bytes em ISO-8859-1. */
function fixture(nome: string): string {
  return new TextDecoder("iso-8859-1").decode(readFileSync(path.join(pastaDasFixtures, nome)));
}

describe("parseListaDeCursos", () => {
  const cursos = parseListaDeCursos(fixture("lista-de-cursos.html"), 86);

  it("encontra as 16 habilitações completas dos 11 cursos da EACH", () => {
    expect(cursos).toHaveLength(16);
    expect(new Set(cursos.map((c) => c.codigo)).size).toBe(11);
  });

  it("deixa o Ciclo Básico de fora", () => {
    expect(cursos.some((c) => /ciclo básico/i.test(c.nome))).toBe(false);
  });

  it("lê código, habilitação, nome com acento e período", () => {
    expect(cursos).toContainEqual({
      codigo: 86200,
      habilitacao: 204,
      nome: "Bacharelado em Sistemas de Informação",
      periodo: "noturno",
      unidade: 86,
    });
    expect(cursos).toContainEqual({
      codigo: 86501,
      habilitacao: 200,
      nome: "Obstetrícia",
      periodo: "integral",
      unidade: 86,
    });
  });

  it("passa no schema", () => {
    for (const curso of cursos) expect(() => cursoSchema.parse(curso)).not.toThrow();
  });

  it("falha alto quando a página não tem cursos", () => {
    expect(() => parseListaDeCursos("<html><body>fora do ar</body></html>", 86)).toThrow(
      ErroDeParser,
    );
  });
});

describe("parseGradeCurricular", () => {
  const curriculo = parseGradeCurricular(fixture("grade-86200-204.html"), {
    codigo: 86200,
    habilitacao: 204,
  });
  const disciplina = (sigla: string) => curriculo.disciplinas.find((d) => d.sigla === sigla);
  const requisitosDe = (sigla: string) => curriculo.requisitos.filter((r) => r.sigla === sigla);

  it("lê as informações básicas do currículo", () => {
    expect(curriculo).toMatchObject({
      codigo_curso: 86200,
      habilitacao: 204,
      data_inicio: "2027-01-01",
      duracao_ideal: 8,
      duracao_minima: 8,
      duracao_maxima: 12,
      carga_obrigatoria: { aula: 1710, trabalho: 1140 },
      carga_optativa_eletiva: { aula: 450, trabalho: 0 },
      carga_optativa_livre: { aula: 0, trabalho: 0 },
      carga_estagio: 480,
      carga_extensao: 330,
    });
  });

  it("lê disciplina obrigatória com semestre ideal e créditos", () => {
    expect(disciplina("ACH2001")).toEqual({
      sigla: "ACH2001",
      nome: "Introdução à Programação",
      tipo: "obrigatoria",
      semestre_ideal: 1,
      creditos_aula: 4,
      creditos_trabalho: 2,
    });
    expect(disciplina("ACH2002")).toMatchObject({ tipo: "obrigatoria", semestre_ideal: 2 });
  });

  it("separa optativas eletivas das obrigatórias", () => {
    expect(disciplina("ACH0141")).toMatchObject({ tipo: "optativa_eletiva", semestre_ideal: 1 });
    const tipos = new Set(curriculo.disciplinas.map((d) => d.tipo));
    expect(tipos).toEqual(new Set(["obrigatoria", "optativa_eletiva"]));
  });

  it("não repete disciplina", () => {
    const siglas = curriculo.disciplinas.map((d) => d.sigla);
    expect(new Set(siglas).size).toBe(siglas.length);
  });

  it("lê os três tipos de requisito", () => {
    expect(requisitosDe("ACH2002")).toEqual([
      { sigla: "ACH2002", sigla_requisito: "ACH2001", tipo: "fraco", grupo: 1 },
    ]);
    const tipos = new Set(curriculo.requisitos.map((r) => r.tipo));
    expect(tipos).toEqual(new Set(["forte", "fraco", "indicacao_conjunto"]));
    expect(curriculo.requisitos.filter((r) => r.tipo === "indicacao_conjunto")).toHaveLength(1);
  });

  it("todo requisito pertence a uma disciplina da grade", () => {
    const siglas = new Set(curriculo.disciplinas.map((d) => d.sigla));
    for (const requisito of curriculo.requisitos) expect(siglas.has(requisito.sigla)).toBe(true);
  });

  it("passa no schema", () => {
    expect(() => curriculoSchema.parse(curriculo)).not.toThrow();
  });

  it("separa requisitos alternativos (linha 'ou') em grupos", () => {
    const efs = parseGradeCurricular(fixture("grade-86050-200.html"), {
      codigo: 86050,
      habilitacao: 200,
    });
    const alternativos = efs.requisitos.filter((r) => r.grupo > 1);
    expect(alternativos.length).toBeGreaterThan(0);
    const exemplo = alternativos.find((r) => r.sigla_requisito === "ACH0506");
    expect(exemplo).toMatchObject({ tipo: "forte", grupo: 2 });
    expect(efs.requisitos).toContainEqual({
      sigla: exemplo?.sigla,
      sigla_requisito: "ACH0585",
      tipo: "forte",
      grupo: 1,
    });
    expect(() => curriculoSchema.parse(efs)).not.toThrow();
  });

  it("falha alto com página que não é uma grade", () => {
    expect(() =>
      parseGradeCurricular("<html><body>erro</body></html>", { codigo: 1, habilitacao: 1 }),
    ).toThrow(ErroDeParser);
  });
});

describe("parseDisciplina", () => {
  const disciplina = parseDisciplina(fixture("disciplina-ACH2036.html"));

  it("lê sigla, nome e créditos", () => {
    expect(disciplina).toMatchObject({
      sigla: "ACH2036",
      nome: "Métodos Quantitativos para Análise Multivariada",
      creditos_aula: 4,
      creditos_trabalho: 0,
      carga_horaria: 60,
    });
  });

  it("lê ementa, objetivos e programa preservando as linhas", () => {
    expect(disciplina.ementa.split("\n")).toEqual([
      "1. Conceitos básicos de análise multivariada.",
      "2. Técnicas de dependência.",
      "3. Técnicas de interdependência.",
      "4. Modelagem e aplicações.",
    ]);
    expect(disciplina.objetivos).toBe(
      "Apresentar os fundamentos e métodos para análise, modelagem e interpretação de dados multivariados.",
    );
    expect(disciplina.programa).toContain("8. Tópicos complementares.");
  });

  it("lê os docentes responsáveis", () => {
    expect(disciplina.docentes).toHaveLength(4);
    expect(disciplina.docentes[0]).toEqual({
      numero_usp: 87769,
      nome: "Ana Amélia Benedito Silva",
    });
  });

  it("passa no schema", () => {
    expect(() => disciplinaSchema.parse(disciplina)).not.toThrow();
  });

  it("falha alto com página que não é de disciplina", () => {
    expect(() => parseDisciplina("<html><body>erro</body></html>")).toThrow(ErroDeParser);
  });
});
