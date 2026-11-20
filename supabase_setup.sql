-- GastroSync: tabla única donde se guardan todos los datos (pedidos, usuarios, menú, etc.)
create table if not exists public.gs_records (
  collection text not null,
  id text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (collection, id)
);

alter table public.gs_records replica identity full;
alter table public.gs_records enable row level security;

-- Política abierta para la demostración (cualquiera con la app puede leer y escribir)
drop policy if exists "gs_demo_all" on public.gs_records;
create policy "gs_demo_all" on public.gs_records
  for all to anon, authenticated
  using (true) with check (true);

grant select, insert, update, delete on public.gs_records to anon, authenticated;

-- Activa el tiempo real para que los cambios aparezcan al instante en todos los aparatos
do $$
begin
  alter publication supabase_realtime add table public.gs_records;
exception when duplicate_object then null;
end $$;
