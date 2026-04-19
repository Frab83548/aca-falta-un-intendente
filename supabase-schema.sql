-- ============================================================
-- Acá falta un intendente — San Pedro de Jujuy
-- Schema completo de Supabase (PostgreSQL + PostGIS)
-- ============================================================
-- Para aplicar: copiá este archivo y pegalo en el SQL Editor
-- de tu proyecto Supabase (https://app.supabase.com)
-- ============================================================

-- Extensión geoespacial (opcional pero recomendada)
create extension if not exists postgis;

-- ============================================================
-- TABLA: reclamos
-- ============================================================
create table if not exists public.reclamos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 1 and 80),
  descripcion text check (char_length(descripcion) <= 400),
  categoria text not null check (categoria in (
    'bache', 'basura', 'luz', 'agua', 'semaforo', 'arbol',
    'inseguridad', 'vereda', 'dengue', 'transporte', 'obra', 'otro'
  )),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  barrio text check (char_length(barrio) <= 60),
  foto_url text,
  estado text not null default 'pendiente' check (estado in (
    'pendiente', 'en_proceso', 'resuelto', 'descartado'
  )),
  autor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Campo geoespacial derivado (para consultas por cercanía)
  ubicacion geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(lng, lat), 4326)::geography
  ) stored
);

-- Índices para performance
create index if not exists idx_reclamos_categoria on public.reclamos(categoria);
create index if not exists idx_reclamos_estado on public.reclamos(estado);
create index if not exists idx_reclamos_created_at on public.reclamos(created_at desc);
create index if not exists idx_reclamos_ubicacion on public.reclamos using gist(ubicacion);

-- ============================================================
-- TABLA: votos (un voto por usuario por reclamo)
-- ============================================================
create table if not exists public.votos (
  id uuid primary key default gen_random_uuid(),
  reclamo_id uuid not null references public.reclamos(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (reclamo_id, usuario_id)
);

create index if not exists idx_votos_reclamo on public.votos(reclamo_id);
create index if not exists idx_votos_usuario on public.votos(usuario_id);

-- ============================================================
-- TABLA: comentarios (para más adelante si querés habilitarlos)
-- ============================================================
create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  reclamo_id uuid not null references public.reclamos(id) on delete cascade,
  autor_id uuid references auth.users(id) on delete set null,
  texto text not null check (char_length(texto) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists idx_comentarios_reclamo on public.comentarios(reclamo_id);

-- ============================================================
-- VISTA: reclamos con conteo de votos (más fácil para el front)
-- ============================================================
create or replace view public.reclamos_con_votos as
select
  r.*,
  coalesce((select count(*) from public.votos v where v.reclamo_id = r.id), 0) as votos_count
from public.reclamos r;

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tg_reclamos_updated_at on public.reclamos;
create trigger tg_reclamos_updated_at
  before update on public.reclamos
  for each row execute function public.tg_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- La seguridad la manejamos en la base, no en el cliente.
-- Así nadie puede abrir la consola del navegador y hacer
-- trampa con los datos.
-- ============================================================

alter table public.reclamos    enable row level security;
alter table public.votos       enable row level security;
alter table public.comentarios enable row level security;

-- ---- Reclamos ----

-- Cualquiera (incluso no autenticado) puede ver los reclamos
drop policy if exists "reclamos_select_public" on public.reclamos;
create policy "reclamos_select_public"
  on public.reclamos for select
  using (true);

-- Solo usuarios autenticados (aunque sea anónimos) pueden crear reclamos
drop policy if exists "reclamos_insert_auth" on public.reclamos;
create policy "reclamos_insert_auth"
  on public.reclamos for insert
  to authenticated
  with check (auth.uid() = autor_id);

-- Solo el autor puede modificar su propio reclamo
drop policy if exists "reclamos_update_autor" on public.reclamos;
create policy "reclamos_update_autor"
  on public.reclamos for update
  to authenticated
  using (auth.uid() = autor_id)
  with check (auth.uid() = autor_id);

-- Nadie puede borrar (ni siquiera el autor). Si quisieras permitir borrar:
-- create policy "reclamos_delete_autor" on public.reclamos for delete
--   to authenticated using (auth.uid() = autor_id);

-- ---- Votos ----

-- Todos pueden ver votos (para mostrar el conteo)
drop policy if exists "votos_select_public" on public.votos;
create policy "votos_select_public"
  on public.votos for select
  using (true);

-- Solo autenticados pueden votar, y solo a nombre propio
drop policy if exists "votos_insert_auth" on public.votos;
create policy "votos_insert_auth"
  on public.votos for insert
  to authenticated
  with check (auth.uid() = usuario_id);

-- Un usuario puede retirar su propio voto
drop policy if exists "votos_delete_propio" on public.votos;
create policy "votos_delete_propio"
  on public.votos for delete
  to authenticated
  using (auth.uid() = usuario_id);

-- ---- Comentarios ----

drop policy if exists "comentarios_select_public" on public.comentarios;
create policy "comentarios_select_public"
  on public.comentarios for select using (true);

drop policy if exists "comentarios_insert_auth" on public.comentarios;
create policy "comentarios_insert_auth"
  on public.comentarios for insert
  to authenticated
  with check (auth.uid() = autor_id);

drop policy if exists "comentarios_delete_propio" on public.comentarios;
create policy "comentarios_delete_propio"
  on public.comentarios for delete
  to authenticated
  using (auth.uid() = autor_id);

-- ============================================================
-- REALTIME
-- ============================================================
-- Habilitar realtime para que los cambios aparezcan en vivo
-- (Supabase también permite hacer esto desde la UI)
-- ============================================================

alter publication supabase_realtime add table public.reclamos;
alter publication supabase_realtime add table public.votos;

-- ============================================================
-- STORAGE: bucket para fotos de reclamos
-- ============================================================
-- Esto hay que crearlo desde la UI de Supabase o con este insert:
-- ============================================================

insert into storage.buckets (id, name, public)
values ('reclamos-fotos', 'reclamos-fotos', true)
on conflict (id) do nothing;

-- Policies del bucket
drop policy if exists "fotos_select_public" on storage.objects;
create policy "fotos_select_public"
  on storage.objects for select
  using (bucket_id = 'reclamos-fotos');

drop policy if exists "fotos_insert_auth" on storage.objects;
create policy "fotos_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'reclamos-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "fotos_delete_propio" on storage.objects;
create policy "fotos_delete_propio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'reclamos-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- DATOS DEMO (opcional — para probar que todo funciona)
-- ============================================================
-- Descomentá este bloque si querés cargar reclamos de ejemplo.
-- Necesitás un autor_id válido — reemplazá los UUIDs o ejecutá
-- desde el front después de autenticarte.
-- ============================================================

-- insert into public.reclamos (titulo, descripcion, categoria, lat, lng, barrio) values
--   ('Pozo enorme', 'Hace meses, ya rompió cubiertas', 'bache', -24.2297, -64.8660, 'Centro'),
--   ('Basural', 'Se juntan residuos', 'basura', -24.2360, -64.8620, 'Bº Libertad'),
--   ('Luminaria quemada', 'Cuadra a oscuras', 'luz', -24.2245, -64.8640, 'Bº Ejército del Norte');
