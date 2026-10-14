-- 初回セットアップ用スキーマ。Supabase SQL Editorで実行してください。
-- 畑はアプリ定数（east / west / north / south）で管理し、畑マスタテーブルは作成しません。
-- Projects.soil_work は SoilWork のJSONB、元肥・追肥は複数件を配列で保持します。

create or replace function public.is_soil_work_valid(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(value) is distinct from 'object' then false
    when jsonb_typeof(value -> 'baseFertilizers') is distinct from 'array' then false
    when jsonb_typeof(value -> 'topDressings') is distinct from 'array' then false
    when jsonb_typeof(value -> 'sowing') is distinct from 'string' then false
    when jsonb_typeof(value -> 'sowingDate') is distinct from 'string' then false
    when jsonb_typeof(value -> 'note') is distinct from 'string' then false
    else
      not exists (
        select 1
        from jsonb_array_elements(value -> 'baseFertilizers') as fertilizer(item)
        where jsonb_typeof(item) is distinct from 'object'
          or jsonb_typeof(item -> 'name') is distinct from 'string'
          or coalesce(item ->> 'name', '') = ''
          or coalesce(item ->> 'date', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          or jsonb_typeof(item -> 'amount') is distinct from 'string'
          or jsonb_typeof(item -> 'note') is distinct from 'string'
      )
      and not exists (
        select 1
        from jsonb_array_elements(value -> 'topDressings') as fertilizer(item)
        where jsonb_typeof(item) is distinct from 'object'
          or jsonb_typeof(item -> 'name') is distinct from 'string'
          or coalesce(item ->> 'name', '') = ''
          or coalesce(item ->> 'date', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          or jsonb_typeof(item -> 'amount') is distinct from 'string'
          or jsonb_typeof(item -> 'note') is distinct from 'string'
      )
      and (
        value ->> 'sowingDate' = ''
        or value ->> 'sowingDate' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      )
  end;
$$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  year integer not null check (year between 2000 and 2100),
  crop_name text not null check (char_length(trim(crop_name)) >= 1),
  field_ids text[] not null check (
    cardinality(field_ids) between 1 and 4
    and field_ids <@ array['east', 'west', 'north', 'south']::text[]
  ),
  start_date date not null,
  end_date date,
  soil_work jsonb not null default '{
    "baseFertilizers": [],
    "topDressings": [],
    "sowing": "",
    "sowingDate": "",
    "note": ""
  }'::jsonb check (public.is_soil_work_valid(soil_work)),
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.project_field_configs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  field_id text not null check (field_id in ('east', 'west', 'north', 'south')),
  ridge_count integer not null check (ridge_count between 1 and 50),
  row_count_per_ridge integer not null check (row_count_per_ridge between 1 and 20),
  plant_count_per_row integer not null check (plant_count_per_row between 1 and 200),
  check (ridge_count::bigint * row_count_per_ridge * plant_count_per_row <= 10000),
  unique (project_id, field_id),
  unique (project_id, field_id, id)
);

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  field_id text not null,
  ridge_number integer not null check (ridge_number >= 1),
  row_number integer not null check (row_number >= 1),
  plant_number integer not null check (plant_number >= 1),
  crop_name text,
  planted_at date,
  status text not null default 'empty'
    check (status in ('empty', 'sprouted', 'growing', 'flowering', 'harvested', 'withered')),
  foreign key (project_id, field_id)
    references public.project_field_configs(project_id, field_id) on delete cascade,
  unique (project_id, field_id, ridge_number, row_number, plant_number),
  unique (project_id, id),
  check (
    (status = 'empty' and crop_name is null and planted_at is null)
    or status <> 'empty'
  )
);

create table public.growth_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  plant_id uuid not null,
  recorded_at date not null,
  status text not null
    check (status in ('sprouted', 'growing', 'flowering', 'harvested', 'withered')),
  note text not null default '' check (char_length(note) <= 500),
  foreign key (project_id, plant_id)
    references public.plants(project_id, id) on delete cascade
);

create index projects_start_date_idx on public.projects(start_date desc);
create index plants_project_field_location_idx
  on public.plants(project_id, field_id, ridge_number, row_number, plant_number);
create index growth_records_project_recorded_at_idx
  on public.growth_records(project_id, recorded_at desc);
create index growth_records_plant_recorded_at_idx
  on public.growth_records(plant_id, recorded_at desc);

-- 畝をルートにしたヒートマップ表示用JSON。
-- state: { projectId, fieldId, ridgeNumber, rows: [{ rowNumber, plants: [...] }] }
create or replace view public.project_ridge_states
with (security_invoker = true)
as
select
  config.project_id,
  config.field_id,
  ridge.ridge_number,
  jsonb_build_object(
    'projectId', config.project_id,
    'fieldId', config.field_id,
    'ridgeNumber', ridge.ridge_number,
    'rows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'rowNumber', row_numbers.row_number,
          'plants', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', plant.id,
                'plantNumber', plant.plant_number,
                'cropName', plant.crop_name,
                'plantedAt', plant.planted_at,
                'status', plant.status
              )
              order by plant.plant_number
            )
            from public.plants plant
            where plant.project_id = config.project_id
              and plant.field_id = config.field_id
              and plant.ridge_number = ridge.ridge_number
              and plant.row_number = row_numbers.row_number
          ), '[]'::jsonb)
        )
        order by row_numbers.row_number
      )
      from generate_series(1, config.row_count_per_ridge) as row_numbers(row_number)
    ), '[]'::jsonb)
  ) as state
from public.project_field_configs config
cross join lateral generate_series(1, config.ridge_count) as ridge(ridge_number);

-- Supabase Authで認証された利用者にアプリテーブルへのアクセスを許可します。
grant select, insert, update, delete
  on public.projects, public.project_field_configs, public.plants, public.growth_records
  to authenticated;
grant select on public.project_ridge_states to authenticated;

alter table public.projects enable row level security;
alter table public.project_field_configs enable row level security;
alter table public.plants enable row level security;
alter table public.growth_records enable row level security;

create policy "Authenticated users manage projects"
  on public.projects for all to authenticated
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
