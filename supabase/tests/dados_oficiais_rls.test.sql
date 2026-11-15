-- Testes de RLS dos dados oficiais. Rode com: pnpm supabase test db
begin;
select plan(25);

-- Dados de exemplo, inseridos como dono do banco (como o scraper faz com a service role).
insert into public.disciplinas (sigla, nome, creditos_aula, creditos_trabalho, carga_horaria, content_hash)
values ('ACH0001', 'Disciplina de teste', 4, 0, 60, 'hash');
insert into public.scraper_runs (status) values ('sucesso');

-- 1. Toda tabela de public tem RLS ligado.
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'todas as tabelas de public têm RLS ligado'
);

-- 2. O gatilho liga RLS sozinho em tabela nova.
create table public.tabela_nova_de_teste (id int);
select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'tabela_nova_de_teste'),
  true,
  'tabela nova nasce com RLS ligado'
);

-- 3. Anônimo e aluno logado leem os dados oficiais, mas não escrevem.
create function pg_temp.checar_papel(papel text) returns setof text language plpgsql as $$
declare
  tabela text;
begin
  execute format('set local role %I', papel);

  foreach tabela in array array[
    'cursos', 'curriculos', 'disciplinas', 'docentes', 'disciplina_docentes',
    'blocos_optativas', 'curriculo_disciplinas', 'requisitos', 'turmas'
  ]
  loop
    return next lives_ok(
      format('select * from public.%I', tabela),
      format('%s consegue ler %s', papel, tabela)
    );
  end loop;

  return next is(
    (select count(*)::int from public.disciplinas),
    1,
    papel || ' enxerga a disciplina de teste'
  );
  return next throws_ok(
    $sql$insert into public.disciplinas (sigla, nome, creditos_aula, creditos_trabalho, carga_horaria, content_hash)
         values ('ACH0002', 'x', 1, 0, 15, 'h')$sql$,
    '42501',
    null,
    papel || ' não consegue inserir disciplina'
  );
  return next throws_ok(
    'select * from public.scraper_runs',
    '42501',
    null,
    papel || ' não enxerga scraper_runs'
  );

  reset role;
end;
$$;

select pg_temp.checar_papel('anon');
select pg_temp.checar_papel('authenticated');

-- 4. Atualizar e apagar não passam nem dão erro: simplesmente não afetam nada, ou são negados.
set local role anon;
select throws_ok(
  $$update public.disciplinas set nome = 'invadido'$$,
  '42501',
  null,
  'anon não consegue alterar disciplina'
);
reset role;

select * from finish();
rollback;
