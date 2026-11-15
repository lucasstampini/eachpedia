-- Primeira migration do Eachpedia. Ainda não cria tabelas.
--
-- Regra do projeto: RLS ligado em TODAS as tabelas, sem exceção.
-- Este gatilho de evento liga RLS automaticamente em toda tabela criada no
-- schema public. Assim, esquecer o "enable row level security" numa migration
-- nunca deixa uma tabela aberta. Uma tabela com RLS e sem policy nega tudo
-- para anon e authenticated, que é o padrão seguro.

create or replace function public.habilitar_rls_automatico()
returns event_trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  comando record;
begin
  for comando in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
      and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', comando.object_identity);
  end loop;
end;
$$;

comment on function public.habilitar_rls_automatico() is
  'Liga RLS em toda tabela nova do schema public. Não remover.';

drop event trigger if exists habilitar_rls_em_tabelas_novas;

create event trigger habilitar_rls_em_tabelas_novas
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.habilitar_rls_automatico();
