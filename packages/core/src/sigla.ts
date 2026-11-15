/**
 * Sigla de disciplina da USP: três letras maiúsculas e quatro dígitos (ex.: ACH2036).
 */
const FORMATO_SIGLA = /^[A-Z]{3}\d{4}$/;
const SIGLAS_NO_TEXTO = /\b[A-Z]{3}\d{4}\b/g;

/** Diz se o texto é exatamente uma sigla de disciplina. */
export function ehSigla(texto: string): boolean {
  return FORMATO_SIGLA.test(texto);
}

/**
 * Encontra todas as siglas de disciplina num texto livre.
 * Devolve sem repetição, na ordem em que aparecem.
 */
export function extrairSiglas(texto: string): string[] {
  return [...new Set(texto.match(SIGLAS_NO_TEXTO) ?? [])];
}
