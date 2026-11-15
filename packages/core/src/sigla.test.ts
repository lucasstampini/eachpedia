import { describe, expect, it } from "vitest";
import { ehSigla, extrairSiglas } from "./sigla";

describe("ehSigla", () => {
  it("aceita três letras maiúsculas e quatro dígitos", () => {
    expect(ehSigla("ACH2036")).toBe(true);
    expect(ehSigla("MAC0110")).toBe(true);
  });

  it("recusa formatos diferentes", () => {
    expect(ehSigla("ach2036")).toBe(false);
    expect(ehSigla("ACH203")).toBe(false);
    expect(ehSigla("ACH20366")).toBe(false);
    expect(ehSigla(" ACH2036")).toBe(false);
    expect(ehSigla("")).toBe(false);
  });
});

describe("extrairSiglas", () => {
  it("encontra as siglas na ordem em que aparecem", () => {
    expect(extrairSiglas("Cursou ACH2036 e depois ACH0021.")).toEqual(["ACH2036", "ACH0021"]);
  });

  it("não repete sigla", () => {
    expect(extrairSiglas("ACH2036 ACH2036 ACH0021")).toEqual(["ACH2036", "ACH0021"]);
  });

  it("ignora o que só parece sigla", () => {
    expect(extrairSiglas("XACH2036 ACH20366 ach2036")).toEqual([]);
  });

  it("devolve lista vazia quando não há sigla", () => {
    expect(extrairSiglas("nada aqui")).toEqual([]);
  });
});
