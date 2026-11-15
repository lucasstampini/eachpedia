-- Dados oficiais do JúpiterWeb (seção 7.1 do CLAUDE.md).
-- Escritos só pelo scraper, com a service role (que ignora RLS). Leitura pública.

create table public.cursos (
  id bigint generated always as identity primary key,
  -- Código do curso no JúpiterWeb (codcur).
  codigo integer not null,
  -- Código da habilitação no JúpiterWeb (codhab).
  habilitacao integer not null,
  nome text not null,
  periodo text not null check (periodo in ('integral', 'matutino', 'vespertino', 'noturno')),
  -- Código da unidade (codcg). A EACH é 86.
  unidade integer not null,
  content_hash text not null,
  atualizado_em timestamptz not null default now(),
  unique (codigo, habilitacao)
);

create table public.curriculos (
  id bigint generated always as identity primary key,
  curso_id bigint not null references public.cursos (id) on delete cascade,
  -- Data de início do currículo no JúpiterWeb. Identifica a versão.
  versao date not null,
  ano_inicio integer not null,
  -- Duração em semestres.
  duracao_ideal integer not null,
  duracao_minima integer not null,
  duracao_maxima integer not null,
  -- Carga horária mínima, em horas, por tipo de disciplina.
  ch_obrigatoria_aula integer not null,
  ch_obrigatoria_trabalho integer not null,
  ch_optativa_eletiva_aula integer not null,
  ch_optativa_eletiva_trabalho integer not null,
  ch_optativa_livre_aula integer not null,
  ch_optativa_livre_trabalho integer not null,
  ch_estagio integer,
  -- Horas de extensão exigidas (AEX).
  ch_extensao integer,
  content_hash text not null,
  atualizado_em timestamptz not null default now(),
  unique (curso_id, versao)
);

create table public.disciplinas (
  sigla text primary key check (sigla ~ '^[A-Z0-9]{7}$'),
  nome text not null,
  creditos_aula integer not null check (creditos_aula >= 0),
  creditos_trabalho integer not null check (creditos_trabalho >= 0),
  carga_horaria integer not null check (carga_horaria >= 0),
  ementa text not null default '',
  objetivos text not null default '',
  programa text not null default '',
  content_hash text not null,
  atualizado_em timestamptz not null default now()
);

create table public.docentes (
  id bigint generated always as identity primary key,
  -- Número USP como aparece na página pública da disciplina.
  numero_usp integer unique,
  nome text not null,
  departamento text
);

-- Docentes responsáveis por uma disciplina, segundo a página pública dela.
create table public.disciplina_docentes (
  sigla text not null references public.disciplinas (sigla) on delete cascade,
  docente_id bigint not null references public.docentes (id) on delete cascade,
  primary key (sigla, docente_id)
);

create table public.blocos_optativas (
  id bigint generated always as identity primary key,
  curriculo_id bigint not null references public.curriculos (id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('optativa_eletiva', 'optativa_livre')),
  creditos_minimos integer not null check (creditos_minimos >= 0),
  unique (curriculo_id, tipo, nome)
);

create table public.curriculo_disciplinas (
  curriculo_id bigint not null references public.curriculos (id) on delete cascade,
  sigla text not null references public.disciplinas (sigla),
  tipo text not null check (tipo in ('obrigatoria', 'optativa_eletiva', 'optativa_livre')),
  semestre_ideal integer not null check (semestre_ideal > 0),
  bloco_id bigint references public.blocos_optativas (id) on delete set null,
  primary key (curriculo_id, sigla)
);

create table public.requisitos (
  curriculo_id bigint not null references public.curriculos (id) on delete cascade,
  -- Disciplina que tem o requisito.
  sigla text not null references public.disciplinas (sigla),
  -- Disciplina exigida.
  sigla_requisito text not null references public.disciplinas (sigla),
  tipo text not null check (tipo in ('forte', 'fraco', 'indicacao_conjunto')),
  -- Grupo de alternativas. No mesmo grupo, todos são exigidos juntos.
  -- Entre grupos vale "ou": basta cumprir um grupo inteiro.
  grupo integer not null default 1 check (grupo > 0),
  primary key (curriculo_id, sigla, sigla_requisito, tipo, grupo)
);

create table public.turmas (
  id bigint generated always as identity primary key,
  sigla text not null references public.disciplinas (sigla),
  -- Semestre no formato AAAA-S, ex.: 2026-2.
  semestre text not null check (semestre ~ '^\d{4}-[12]$'),
  codigo_turma text not null,
  docente_ids bigint[] not null default '{}',
  horarios jsonb not null default '[]'::jsonb,
  content_hash text not null,
  atualizado_em timestamptz not null default now(),
  unique (sigla, semestre, codigo_turma)
);

create table public.scraper_runs (
  id bigint generated always as identity primary key,
  inicio timestamptz not null default now(),
  fim timestamptz,
  status text not null default 'rodando' check (status in ('rodando', 'sucesso', 'falha')),
  -- Resumo do que mudou: quantos novos, alterados e inalterados por entidade.
  diff jsonb,
  erro text
);

create index curriculos_curso_id_idx on public.curriculos (curso_id);
create index curriculo_disciplinas_sigla_idx on public.curriculo_disciplinas (sigla);
create index requisitos_sigla_requisito_idx on public.requisitos (sigla_requisito);
create index disciplina_docentes_docente_id_idx on public.disciplina_docentes (docente_id);
create index turmas_sigla_semestre_idx on public.turmas (sigla, semestre);

-- RLS em todas as tabelas (o gatilho da primeira migration já liga, aqui fica explícito).
alter table public.cursos enable row level security;
alter table public.curriculos enable row level security;
alter table public.disciplinas enable row level security;
alter table public.docentes enable row level security;
alter table public.disciplina_docentes enable row level security;
alter table public.blocos_optativas enable row level security;
alter table public.curriculo_disciplinas enable row level security;
alter table public.requisitos enable row level security;
alter table public.turmas enable row level security;
alter table public.scraper_runs enable row level security;

-- Leitura pública dos dados oficiais. Ninguém escreve por aqui: só a service role.
do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'cursos', 'curriculos', 'disciplinas', 'docentes', 'disciplina_docentes',
    'blocos_optativas', 'curriculo_disciplinas', 'requisitos', 'turmas'
  ]
  loop
    execute format('revoke all on public.%I from anon, authenticated', tabela);
    execute format('grant select on public.%I to anon, authenticated', tabela);
    execute format(
      'create policy "leitura publica" on public.%I for select to anon, authenticated using (true)',
      tabela
    );
  end loop;
end;
$$;

-- scraper_runs é interno: sem policy e sem grant, só a service role enxerga.
revoke all on public.scraper_runs from anon, authenticated;
