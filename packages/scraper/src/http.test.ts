import { describe, expect, it, vi } from "vitest";

import { USER_AGENT } from "./config.ts";
import { contentHash } from "./hash.ts";
import { criarCliente } from "./http.ts";

/** Resposta falsa com o corpo em ISO-8859-1, como o JúpiterWeb manda. */
function respostaLatin1(texto: string, status = 200): Response {
  return new Response(Buffer.from(texto, "latin1"), {
    status,
    headers: { "content-type": "text/html;charset=ISO-8859-1" },
  });
}

describe("criarCliente", () => {
  it("decodifica ISO-8859-1 e se identifica com o User-Agent do projeto", async () => {
    const fetchImpl = vi.fn(async () => respostaLatin1("Obstetrícia"));
    const cliente = criarCliente({ fetchImpl, esperar: async () => {} });

    expect(await cliente.buscar("pagina")).toBe("Obstetrícia");
    const [url, opcoes] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://uspdigital.usp.br/jupiterweb/pagina");
    expect(opcoes.headers).toMatchObject({ "User-Agent": USER_AGENT });
  });

  it("espera pelo menos 1 segundo entre requisições, mesmo se pedirem menos", async () => {
    const esperas: number[] = [];
    const cliente = criarCliente({
      intervaloMs: 10,
      fetchImpl: async () => respostaLatin1("ok"),
      esperar: async (ms) => {
        esperas.push(ms);
      },
    });

    await cliente.buscar("a");
    await cliente.buscar("b");
    expect(esperas).toHaveLength(1);
    expect(esperas[0]).toBeGreaterThan(900);
  });

  it("tenta de novo quando o servidor falha e desiste depois de 4 tentativas", async () => {
    const fetchImpl = vi
      .fn<() => Promise<Response>>()
      .mockResolvedValueOnce(respostaLatin1("erro", 503))
      .mockResolvedValueOnce(respostaLatin1("ok"));
    const cliente = criarCliente({ fetchImpl, esperar: async () => {} });
    expect(await cliente.buscar("a")).toBe("ok");
    expect(cliente.requisicoes()).toBe(2);

    const semprefalha = criarCliente({
      fetchImpl: async () => respostaLatin1("erro", 500),
      esperar: async () => {},
    });
    await expect(semprefalha.buscar("a")).rejects.toThrow(/Não consegui baixar/);
    expect(semprefalha.requisicoes()).toBe(4);
  });

  it("não insiste em erro 404", async () => {
    const cliente = criarCliente({
      fetchImpl: async () => respostaLatin1("sumiu", 404),
      esperar: async () => {},
    });
    await expect(cliente.buscar("a")).rejects.toThrow();
    expect(cliente.requisicoes()).toBe(1);
  });
});

describe("contentHash", () => {
  it("não depende da ordem dos campos", () => {
    expect(contentHash({ a: 1, b: [1, 2] })).toBe(contentHash({ b: [1, 2], a: 1 }));
  });

  it("muda quando o conteúdo muda", () => {
    expect(contentHash({ a: 1 })).not.toBe(contentHash({ a: 2 }));
    expect(contentHash([1, 2])).not.toBe(contentHash([2, 1]));
  });
});
