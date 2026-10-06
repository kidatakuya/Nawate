-- Supabase SQL Editorで実行する初期スキーマ。
-- 農業データは正規化して保存し、project_ridge_statesビューで畝単位のJSONを取得する。

create table public.field_masters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 40)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  year integer not null check (year between 1900 and 9999),
  crop_name text not null check (char_length(trim(crop_name)) between 1 and 100),
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.project_fields (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  field_id uuid not null references public.field_masters(id) on delete cascade,
  unique (project_id, field_id),
  unique (project_id, id)
);

create table public.project_field_configs (
  project_field_id uuid primary key references public.project_fields(id) on delete cascade,
  ridge_count integer not null check (ridge_count between 1 and 100),
  row_count_per_ridge integer not null check (row_count_per_ridge between 1 and 100),
  plant_count_per_row integer not null check (plant_count_per_row between 1 and 1000),
  check (ridge_count * row_count_per_ridge * plant_count_per_row <= 100000)
);

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  project_field_id uuid not null,
  ridge_number integer not null check (ridge_number >= 1),
  row_number integer not null check (row_number >= 1),
  plant_number integer not null check (plant_number >= 1),
  crop_name text,
  planted_at date,
  status text not null default 'empty'
    check (status in ('empty', 'sprouted', 'growing', 'flowering', 'harvested', 'withered')),
  foreign key (project_id, project_field_id)
    references public.project_fields(project_id, id) on delete cascade,
  unique (project_field_id, ridge_number, row_number, plant_number),
  unique (project_id, id),
  check (
    status <> 'empty'
    or (crop_name is null and planted_at is null)
  )
);

create table public.growth_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  plant_id uuid not null,
  recorded_at date not null,
  status text not null
    check (status in ('empty', 'sprouted', 'growing', 'flowering', 'harvested', 'withered')),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  foreign key (project_id, plant_id)
    references public.plants(project_id, id) on delete cascade
);

create index plants_project_field_location_idx
  on public.plants(project_field_id, ridge_number, row_number, plant_number);
create index growth_records_project_recorded_at_idx
  on public.growth_records(project_id, recorded_at desc);

-- 畝をルートにしたオブジェクト。
-- stateの形: { projectFieldId, ridgeNumber, rows: [{ rowNumber, plants: [...] }] }
create or replace view public.project_ridge_states
with (security_invoker = true)
as
select
  pf.project_id,
  pf.field_id,
  pf.id as project_field_id,
  ridge.ridge_number,
  jsonb_build_object(
    'projectFieldId', pf.id,
    'ridgeNumber', ridge.ridge_number,
    'rows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'rowNumber', row_numbers.row_number,
          'plants', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', p.id,
                'plantNumber', p.plant_number,
                'cropName', p.crop_name,
                'plantedAt', p.planted_at,
                'status', p.status
              )
              order by p.plant_number
            )
            from public.plants p
            where p.project_field_id = pf.id
              and p.ridge_number = ridge.ridge_number
              and p.row_number = row_numbers.row_number
          ), '[]'::jsonb)
        )
        order by row_numbers.row_number
      )
      from generate_series(1, config.row_count_per_ridge) as row_numbers(row_number)
    ), '[]'::jsonb)
  ) as state
from public.project_fields pf
join public.project_field_configs config on config.project_field_id = pf.id
cross join lateral generate_series(1, config.ridge_count) as ridge(ridge_number);

-- 畑は進行中プロジェクトで使用中なら削除不可。
create or replace function public.prevent_deleting_field_in_active_project()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.project_fields pf
    join public.projects p on p.id = pf.project_id
    where pf.field_id = old.id
      and p.end_date is null
  ) then
    raise exception '進行中のプロジェクトで使用中の畑は削除できません';
  end if;
  return old;
end;
$$;

create trigger field_active_project_delete_guard
before delete on public.field_masters
for each row execute function public.prevent_deleting_field_in_active_project();

-- このアプリはSupabase Authで管理者だけがログインする想定。
grant select, insert, update, delete
  on public.field_masters, public.projects, public.project_fields,
     public.project_field_configs, public.plants, public.growth_records
  to authenticated;
grant select on public.project_ridge_states to authenticated;

alter table public.field_masters enable row level security;
alter table public.projects enable row level security;
alter table public.project_fields enable row level security;
alter table public.project_field_configs enable row level security;
alter table public.plants enable row level security;
alter table public.growth_records enable row level security;

create policy "Authenticated users manage field masters"
  on public.field_masters for all to authenticated
  using (true) with check (true);
create policy "Authenticated users manage projects"
  on public.projects for all to authenticated
  using (true) with check (true);
create policy "Authenticated users manage project fields"
  on public.project_fields for all to authenticated
  using (true) with check (true);
create policy "Authenticated users manage project field configs"
  on public.project_field_configs for all to authenticated
  using (true) with check (true);
create policy "Authenticated users manage plants"
  on public.plants for all to authenticated
  using (true) with check (true);
create policy "Authenticated users manage growth records"
  on public.growth_records for all to authenticated
  using (true) with check (true);
