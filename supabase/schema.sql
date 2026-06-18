-- =============================================================================
-- BioBal — esquema de la tabla `leads`
-- -----------------------------------------------------------------------------
-- Ejecutá este script en el proyecto de Supabase:
--   Dashboard → SQL Editor → New query → pegar y "Run".
-- Crea la tabla `leads` y habilita RLS permitiendo SOLO insert con el anon key
-- (insert público, sin lectura). Así el formulario puede guardar leads desde el
-- navegador sin exponer los datos cargados.
-- =============================================================================

-- gen_random_uuid() viene de pgcrypto (suele estar habilitada en Supabase).
create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  nombre       text        not null,
  email        text        not null,
  telefono     text        not null,
  especialidad text,
  mensaje      text
);

-- Habilitar Row Level Security: sin policies, nadie puede tocar la tabla.
alter table public.leads enable row level security;

-- Permitir INSERT público (anon y authenticated). No se crean policies de
-- SELECT/UPDATE/DELETE, por lo que el anon key NO puede leer ni modificar leads.
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- Índice para ordenar/consultar por fecha desde el panel de Supabase.
create index if not exists leads_created_at_idx on public.leads (created_at desc);
