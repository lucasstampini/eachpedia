import { creditosDaCarga, type DadosOficiais } from "@eachpedia/core";
import type { SupabaseClient } from "@supabase/supabase-js";

import { contentHash } from "./hash.ts";

export type Contagem = { novos: number; alterados: number; inalterados: number };
export type Diff = Record<"cursos" | "curriculos" | "disciplinas" | "docentes", Contagem>;

const zero = (): Contagem => ({ novos: 0, alterados: 0, inalterados: 0 });

/** O diff tem alguma mudança? Na segunda execução seguida tem que dar falso. */
export function houveMudanca(diff: Diff): boolean {
  return Object.values(diff).some((c) => c.novos > 0 || c.alterados > 0);
}

/** Para o supabase-js: lança erro se a chamada falhou e devolve os dados. */
function ok<T>(resposta: { data: T; error: { message: string } | null }, oQue: string): T {
  if (resposta.error) throw new Error(`Falha ao ${oQue}: ${resposta.error.message}`);
  return resposta.data;
}

/** Lê uma tabela inteira, página por página (o PostgREST limita 1000 linhas por vez). */
async function lerTudo<T>(db: SupabaseClient, tabela: string, colunas: string): Promise<T[]> {
  const linhas: T[] = [];
  for (let inicio = 0; ; inicio += 1000) {
    const pagina = ok(
      await db
        .from(tabela)
        .select(colunas)
        .range(inicio, inicio + 999),
      `ler ${tabela}`,
    ) as T[];
    linhas.push(...pagina);
    if (pagina.length < 1000) return linhas;
  }
}

/** Grava em lotes para não estourar o tamanho da requisição. */
function emLotes<T>(itens: T[], tamanho = 200): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) lotes.push(itens.slice(i, i + tamanho));
  return lotes;
}

/**
 * Grava os dados coletados no banco, comparando o content_hash de cada entidade.
 * O que não mudou não é regravado. Dado oficial nunca é apagado sozinho: só os
 * vínculos de um currículo (disciplinas, requisitos e blocos) são trocados quando ele muda.
 */
export async function gravar(db: SupabaseClient, dados: DadosOficiais): Promise<Diff> {
  const diff: Diff = { cursos: zero(), curriculos: zero(), disciplinas: zero(), docentes: zero() };
  const agora = new Date().toISOString();

  // 1. Docentes
  const docentesColetados = new Map<number, string>();
  for (const disciplina of dados.disciplinas) {
    for (const docente of disciplina.docentes) {
      docentesColetados.set(docente.numero_usp, docente.nome);
    }
  }
  const docentesNoBanco = new Map(
    (await lerTudo<{ numero_usp: number; nome: string }>(db, "docentes", "numero_usp, nome")).map(
      (d) => [d.numero_usp, d.nome],
    ),
  );
  const docentesParaGravar: { numero_usp: number; nome: string }[] = [];
  for (const [numero_usp, nome] of docentesColetados) {
    const atual = docentesNoBanco.get(numero_usp);
    if (atual === nome) diff.docentes.inalterados++;
    else {
      if (atual === undefined) diff.docentes.novos++;
      else diff.docentes.alterados++;
      docentesParaGravar.push({ numero_usp, nome });
    }
  }
  for (const lote of emLotes(docentesParaGravar)) {
    ok(await db.from("docentes").upsert(lote, { onConflict: "numero_usp" }), "gravar docentes");
  }
  const idDoDocente = new Map(
    (await lerTudo<{ id: number; numero_usp: number }>(db, "docentes", "id, numero_usp")).map(
      (d) => [d.numero_usp, d.id],
    ),
  );

  // 2. Disciplinas
  const hashDaDisciplina = new Map(
    (
      await lerTudo<{ sigla: string; content_hash: string }>(
        db,
        "disciplinas",
        "sigla, content_hash",
      )
    ).map((d) => [d.sigla, d.content_hash]),
  );
  const disciplinasMudadas = dados.disciplinas.filter((disciplina) => {
    const hash = contentHash(disciplina);
    const atual = hashDaDisciplina.get(disciplina.sigla);
    if (atual === hash) {
      diff.disciplinas.inalterados++;
      return false;
    }
    if (atual === undefined) diff.disciplinas.novos++;
    else diff.disciplinas.alterados++;
    return true;
  });
  for (const lote of emLotes(disciplinasMudadas)) {
    ok(
      await db.from("disciplinas").upsert(
        lote.map(({ docentes: _docentes, ...disciplina }) => ({
          ...disciplina,
          content_hash: contentHash({ ...disciplina, docentes: _docentes }),
          atualizado_em: agora,
        })),
        { onConflict: "sigla" },
      ),
      "gravar disciplinas",
    );
    const siglas = lote.map((d) => d.sigla);
    ok(await db.from("disciplina_docentes").delete().in("sigla", siglas), "limpar docentes");
    const vinculos = lote.flatMap((disciplina) =>
      disciplina.docentes.map((docente) => ({
        sigla: disciplina.sigla,
        docente_id: idDoDocente.get(docente.numero_usp),
      })),
    );
    if (vinculos.length > 0) {
      ok(await db.from("disciplina_docentes").insert(vinculos), "vincular docentes");
    }
  }

  // 3. Cursos
  type CursoNoBanco = { id: number; codigo: number; habilitacao: number; content_hash: string };
  const chave = (codigo: number, habilitacao: number) => `${codigo}/${habilitacao}`;
  const lerCursos = async () =>
    new Map(
      (await lerTudo<CursoNoBanco>(db, "cursos", "id, codigo, habilitacao, content_hash")).map(
        (c) => [chave(c.codigo, c.habilitacao), c],
      ),
    );
  const cursosAntes = await lerCursos();
  const cursosParaGravar = dados.cursos.flatMap((curso) => {
    const hash = contentHash(curso);
    const atual = cursosAntes.get(chave(curso.codigo, curso.habilitacao));
    if (atual?.content_hash === hash) {
      diff.cursos.inalterados++;
      return [];
    }
    if (atual === undefined) diff.cursos.novos++;
    else diff.cursos.alterados++;
    return [{ ...curso, content_hash: hash, atualizado_em: agora }];
  });
  if (cursosParaGravar.length > 0) {
    ok(
      await db.from("cursos").upsert(cursosParaGravar, { onConflict: "codigo,habilitacao" }),
      "gravar cursos",
    );
  }
  const cursosDepois = await lerCursos();

  // 4. Currículos, com disciplinas, blocos e requisitos
  const hashDoCurriculo = new Map(
    (
      await lerTudo<{ curso_id: number; versao: string; content_hash: string }>(
        db,
        "curriculos",
        "curso_id, versao, content_hash",
      )
    ).map((c) => [`${c.curso_id}/${c.versao}`, c.content_hash]),
  );

  for (const curriculo of dados.curriculos) {
    const curso = cursosDepois.get(chave(curriculo.codigo_curso, curriculo.habilitacao));
    if (!curso)
      throw new Error(`Currículo de um curso que não está na lista: ${curriculo.codigo_curso}.`);

    const hash = contentHash(curriculo);
    const atual = hashDoCurriculo.get(`${curso.id}/${curriculo.data_inicio}`);
    if (atual === hash) {
      diff.curriculos.inalterados++;
      continue;
    }
    if (atual === undefined) diff.curriculos.novos++;
    else diff.curriculos.alterados++;

    // O hash só entra no fim. Se algo falhar no meio, a próxima execução refaz este currículo.
    const [gravado] = ok(
      await db
        .from("curriculos")
        .upsert(
          {
            curso_id: curso.id,
            versao: curriculo.data_inicio,
            ano_inicio: Number(curriculo.data_inicio.slice(0, 4)),
            duracao_ideal: curriculo.duracao_ideal,
            duracao_minima: curriculo.duracao_minima,
            duracao_maxima: curriculo.duracao_maxima,
            ch_obrigatoria_aula: curriculo.carga_obrigatoria.aula,
            ch_obrigatoria_trabalho: curriculo.carga_obrigatoria.trabalho,
            ch_optativa_eletiva_aula: curriculo.carga_optativa_eletiva.aula,
            ch_optativa_eletiva_trabalho: curriculo.carga_optativa_eletiva.trabalho,
            ch_optativa_livre_aula: curriculo.carga_optativa_livre.aula,
            ch_optativa_livre_trabalho: curriculo.carga_optativa_livre.trabalho,
            ch_estagio: curriculo.carga_estagio,
            ch_extensao: curriculo.carga_extensao,
            content_hash: "gravando",
            atualizado_em: agora,
          },
          { onConflict: "curso_id,versao" },
        )
        .select("id"),
      "gravar currículo",
    ) as { id: number }[];
    if (!gravado) throw new Error("O banco não devolveu o currículo gravado.");
    const curriculo_id = gravado.id;

    ok(await db.from("requisitos").delete().eq("curriculo_id", curriculo_id), "limpar requisitos");
    ok(
      await db.from("curriculo_disciplinas").delete().eq("curriculo_id", curriculo_id),
      "limpar disciplinas do currículo",
    );
    ok(
      await db.from("blocos_optativas").delete().eq("curriculo_id", curriculo_id),
      "limpar blocos",
    );

    const blocos = (
      [
        ["optativa_eletiva", "Optativas eletivas", curriculo.carga_optativa_eletiva],
        ["optativa_livre", "Optativas livres", curriculo.carga_optativa_livre],
      ] as const
    )
      .map(([tipo, nome, carga]) => ({
        curriculo_id,
        tipo,
        nome,
        creditos_minimos: creditosDaCarga(carga),
      }))
      .filter((bloco) => bloco.creditos_minimos > 0);
    const idDoBloco = new Map<string, number>();
    if (blocos.length > 0) {
      const gravados = ok(
        await db.from("blocos_optativas").insert(blocos).select("id, tipo"),
        "gravar blocos",
      ) as { id: number; tipo: string }[];
      for (const bloco of gravados) idDoBloco.set(bloco.tipo, bloco.id);
    }

    for (const lote of emLotes(curriculo.disciplinas)) {
      ok(
        await db.from("curriculo_disciplinas").insert(
          lote.map((disciplina) => ({
            curriculo_id,
            sigla: disciplina.sigla,
            tipo: disciplina.tipo,
            semestre_ideal: disciplina.semestre_ideal,
            bloco_id: idDoBloco.get(disciplina.tipo) ?? null,
          })),
        ),
        "gravar disciplinas do currículo",
      );
    }
    for (const lote of emLotes(curriculo.requisitos)) {
      ok(
        await db.from("requisitos").insert(lote.map((r) => ({ curriculo_id, ...r }))),
        "gravar requisitos",
      );
    }
    ok(
      await db.from("curriculos").update({ content_hash: hash }).eq("id", curriculo_id),
      "fechar currículo",
    );
  }

  return diff;
}
