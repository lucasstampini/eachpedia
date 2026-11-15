import { describe, expect, it } from "vitest";
import { INTERVALO_MINIMO_MS, URL_REPOSITORIO, USER_AGENT } from "./config.ts";

describe("configuração do scraper", () => {
  it("identifica o projeto e aponta para o repositório no User-Agent", () => {
    expect(USER_AGENT).toContain("Eachpedia");
    expect(USER_AGENT).toContain(URL_REPOSITORIO);
  });

  it("nunca passa de 1 requisição por segundo", () => {
    expect(INTERVALO_MINIMO_MS).toBeGreaterThanOrEqual(1000);
  });
});
