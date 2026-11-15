import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { createClient } from "@supabase/supabase-js";

import { coletar } from "./coletar.ts";
import { USER_AGENT } from "./config.ts";
import { gravar, houveMudanca } from "./gravar.ts";
import { criarCliente } from "./http.ts";

const AJUDA = `Scraper do Eachpedia: coleta os dados públicos do JúpiterWeb.

Uso: pnpm scrape [opções]

  --sem-banco        Só coleta e valida. Não grava no Supabase.
  --sem-cache        Não usa o cache local de páginas (sempre baixa de novo).
  --curso <codigo>   Coleta só este código de curso (pode repetir). Bom para testar.
  --saida <arquivo>  Salva o JSON coletado neste arquivo.
  --ajuda            Mostra esta mensagem.

Para gravar, defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.`;

const pastaDoPacote = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function principal(): Promise<void> {
  const { values: opcoes } = parseArgs({
    options: {
      "sem-banco": { type: "boolean", default: false },
      "sem-cache": { type: "boolean", default: false },
      curso: { type: "string", multiple: true },
      saida: { type: "string" },
      ajuda: { type: "boolean", default: false },
    },
  });
  if (opcoes.ajuda) {
    console.log(AJUDA);
    return;
  }

  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const gravarNoBanco = !opcoes["sem-banco"];
  if (gravarNoBanco && (!url || !chave)) {
    throw new Error(
      "Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY. Defina as duas ou use --sem-banco.",
    );
  }
  const db = gravarNoBanco && url && chave ? createClient(url, chave) : null;

  // O registro da execução abre antes da coleta, para falhas também ficarem no histórico.
  let runId: number | null = null;
  if (db) {
    const { data, error } = await db.from("scraper_runs").insert({}).select("id").single();
    if (error) throw new Error(`Não consegui registrar a execução: ${error.message}`);
    runId = data.id as number;
  }

  try {
    const cliente = criarCliente({
      pastaDoCache: opcoes["sem-cache"] ? undefined : path.join(pastaDoPacote, ".cache", "paginas"),
    });
    console.log(`Identificação: ${USER_AGENT}`);

    const dados = await coletar(cliente, {
      apenasCursos: opcoes.curso?.map(Number),
      avisar: (mensagem) => console.log(mensagem),
    });
    console.log(
      `Coletado: ${dados.cursos.length} cursos, ${dados.curriculos.length} currículos, ` +
        `${dados.disciplinas.length} disciplinas (${cliente.requisicoes()} requisições de rede).`,
    );

    if (opcoes.saida) {
      const arquivo = path.resolve(opcoes.saida);
      await mkdir(path.dirname(arquivo), { recursive: true });
      await writeFile(arquivo, JSON.stringify(dados, null, 2), "utf8");
      console.log(`JSON salvo em ${arquivo}`);
    }

    if (db && runId !== null) {
      const diff = await gravar(db, dados);
      await db
        .from("scraper_runs")
        .update({ status: "sucesso", fim: new Date().toISOString(), diff })
        .eq("id", runId);
      console.table(diff);
      console.log(houveMudanca(diff) ? "Banco atualizado." : "Nada mudou desde a última execução.");
    }
  } catch (erro) {
    if (db && runId !== null) {
      await db
        .from("scraper_runs")
        .update({
          status: "falha",
          fim: new Date().toISOString(),
          erro: erro instanceof Error ? erro.message : String(erro),
        })
        .eq("id", runId);
    }
    throw erro;
  }
}

principal().catch((erro: unknown) => {
  console.error("O scraper falhou e nada mais foi gravado.");
  console.error(erro);
  process.exitCode = 1;
});
