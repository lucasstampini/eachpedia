import { z } from "zod";

/**
 * Schemas dos dados oficiais (vindos do JúpiterWeb).
 * São compartilhados entre o scraper, o domínio e o site.
 */

/** Sigla de disciplina como o JúpiterWeb publica: 7 caracteres, letras maiúsculas e dígitos. */
export const siglaSchema = z.string().regex(/^[A-Z0-9]{7}$/, "sigla de disciplina inválida");

const inteiroNaoNegativo = z.number().int().nonnegative();
const textoNaoVazio = z.string().trim().min(1);

export const PERIODOS = ["integral", "matutino", "vespertino", "noturno"] as const;
export const periodoSchema = z.enum(PERIODOS);
export type Periodo = z.infer<typeof periodoSchema>;

export const TIPOS_REQUISITO = ["forte", "fraco", "indicacao_conjunto"] as const;
export const tipoRequisitoSchema = z.enum(TIPOS_REQUISITO);
export type TipoRequisito = z.infer<typeof tipoRequisitoSchema>;

export const TIPOS_DISCIPLINA = ["obrigatoria", "optativa_eletiva", "optativa_livre"] as const;
export const tipoDisciplinaSchema = z.enum(TIPOS_DISCIPLINA);
export type TipoDisciplina = z.infer<typeof tipoDisciplinaSchema>;

/** Horas por crédito na USP. */
export const HORAS_POR_CREDITO_AULA = 15;
export const HORAS_POR_CREDITO_TRABALHO = 30;

export const cursoSchema = z.object({
  /** Código do curso no JúpiterWeb (codcur). */
  codigo: z.number().int().positive(),
  /** Código da habilitação no JúpiterWeb (codhab). */
  habilitacao: z.number().int().positive(),
  nome: textoNaoVazio,
  periodo: periodoSchema,
  /** Código da unidade (codcg). A EACH é 86. */
  unidade: z.number().int().positive(),
});
export type Curso = z.infer<typeof cursoSchema>;

export const cargaHorariaSchema = z.object({
  aula: inteiroNaoNegativo,
  trabalho: inteiroNaoNegativo,
});
export type CargaHoraria = z.infer<typeof cargaHorariaSchema>;

export const curriculoDisciplinaSchema = z.object({
  sigla: siglaSchema,
  nome: textoNaoVazio,
  tipo: tipoDisciplinaSchema,
  semestre_ideal: z.number().int().positive(),
  creditos_aula: inteiroNaoNegativo,
  creditos_trabalho: inteiroNaoNegativo,
});
export type CurriculoDisciplina = z.infer<typeof curriculoDisciplinaSchema>;

export const requisitoSchema = z.object({
  /** Disciplina que tem o requisito. */
  sigla: siglaSchema,
  /** Disciplina exigida. */
  sigla_requisito: siglaSchema,
  tipo: tipoRequisitoSchema,
  /**
   * Grupo de alternativas, começando em 1. Dentro de um grupo, todos os requisitos
   * são exigidos juntos. Entre grupos vale "ou": basta cumprir um grupo inteiro.
   * A maioria das disciplinas tem só o grupo 1.
   */
  grupo: z.number().int().positive(),
});
export type Requisito = z.infer<typeof requisitoSchema>;

export const curriculoSchema = z.object({
  codigo_curso: z.number().int().positive(),
  habilitacao: z.number().int().positive(),
  /** Data de início do currículo, no formato AAAA-MM-DD. Identifica a versão. */
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Duração em semestres. */
  duracao_ideal: z.number().int().positive(),
  duracao_minima: z.number().int().positive(),
  duracao_maxima: z.number().int().positive(),
  /** Carga horária mínima exigida, em horas, por tipo de disciplina. */
  carga_obrigatoria: cargaHorariaSchema,
  carga_optativa_eletiva: cargaHorariaSchema,
  carga_optativa_livre: cargaHorariaSchema,
  /** Horas de estágio, quando o currículo informa. */
  carga_estagio: inteiroNaoNegativo.nullable(),
  /** Horas de extensão exigidas (AEX), quando o currículo informa. */
  carga_extensao: inteiroNaoNegativo.nullable(),
  disciplinas: z.array(curriculoDisciplinaSchema).min(1),
  requisitos: z.array(requisitoSchema),
});
export type Curriculo = z.infer<typeof curriculoSchema>;

export const docenteSchema = z.object({
  numero_usp: z.number().int().positive(),
  nome: textoNaoVazio,
});
export type Docente = z.infer<typeof docenteSchema>;

export const disciplinaSchema = z.object({
  sigla: siglaSchema,
  nome: textoNaoVazio,
  creditos_aula: inteiroNaoNegativo,
  creditos_trabalho: inteiroNaoNegativo,
  /** Carga horária total em horas. */
  carga_horaria: inteiroNaoNegativo,
  ementa: z.string(),
  objetivos: z.string(),
  programa: z.string(),
  /** Docentes responsáveis listados na página pública da disciplina. */
  docentes: z.array(docenteSchema),
});
export type Disciplina = z.infer<typeof disciplinaSchema>;

/** Tudo que uma execução do scraper coleta. */
export const dadosOficiaisSchema = z.object({
  cursos: z.array(cursoSchema).min(1),
  curriculos: z.array(curriculoSchema).min(1),
  disciplinas: z.array(disciplinaSchema).min(1),
});
export type DadosOficiais = z.infer<typeof dadosOficiaisSchema>;

/** Converte carga horária mínima em créditos (15 h por crédito aula, 30 h por crédito trabalho). */
export function creditosDaCarga(carga: CargaHoraria): number {
  return Math.round(
    carga.aula / HORAS_POR_CREDITO_AULA + carga.trabalho / HORAS_POR_CREDITO_TRABALHO,
  );
}
