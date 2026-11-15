import { createHash } from "node:crypto";

/** JSON com as chaves em ordem alfabética, para o hash não depender da ordem dos campos. */
function jsonEstavel(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(jsonEstavel).join(",")}]`;
  if (valor !== null && typeof valor === "object") {
    const pares = Object.entries(valor)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([chave, v]) => `${JSON.stringify(chave)}:${jsonEstavel(v)}`);
    return `{${pares.join(",")}}`;
  }
  return JSON.stringify(valor);
}

/** Hash do conteúdo de uma entidade. Mudou o hash, mudou o dado oficial. */
export function contentHash(valor: unknown): string {
  return createHash("sha256").update(jsonEstavel(valor)).digest("hex");
}
