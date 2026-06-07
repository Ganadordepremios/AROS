-- Tempo OS — Planes / Tiers / Asientos + contadores (v0.11.0-alpha)
-- Correr en Supabase → SQL Editor. Idempotente.

-- ──────────────────────────────────────────────────────────────
-- 1) teams: plan + contadores mensuales
-- ──────────────────────────────────────────────────────────────
alter table public.teams
  add column if not exists plan text not null default 'free'
    check (plan in ('free','pro','manager','custom')),
  add column if not exists ideas_generadas_mes int not null default 0,
  add column if not exists ideas_reset_date date not null default current_date,
  add column if not exists banco_refreshes int not null default 0,
  add column if not exists banco_refreshes_reset_date date not null default current_date;

-- ──────────────────────────────────────────────────────────────
-- 2) team_members: asiento + flag de "artista" (único por equipo)
-- ──────────────────────────────────────────────────────────────
alter table public.team_members
  add column if not exists is_artist boolean not null default false,
  add column if not exists seat_type text not null default 'included'
    check (seat_type in ('included','additional'));

create unique index if not exists one_artist_per_team
  on public.team_members (team_id)
  where is_artist = true;

-- ──────────────────────────────────────────────────────────────
-- 3) RPC: reset mensual de contadores (se llama al cargar sesión)
-- ──────────────────────────────────────────────────────────────
create or replace function public.reset_monthly_counters(tid uuid)
returns void language plpgsql security definer as $$
begin
  update public.teams set
    ideas_generadas_mes = 0,
    ideas_reset_date = current_date
  where id = tid and date_trunc('month', ideas_reset_date) < date_trunc('month', current_date);

  update public.teams set
    banco_refreshes = 0,
    banco_refreshes_reset_date = current_date
  where id = tid and date_trunc('month', banco_refreshes_reset_date) < date_trunc('month', current_date);
end;
$$;
grant execute on function public.reset_monthly_counters(uuid) to authenticated;

-- ──────────────────────────────────────────────────────────────
-- 4) RLS reforzada por rol
--    Ajusta los nombres de política a los que ya tengas. Asume helpers existentes:
--    is_member(team_id), is_editor(team_id), is_owner(team_id).
-- ──────────────────────────────────────────────────────────────

-- 4a) Solo OWNER puede modificar team_members (invitar, cambiar rol, asignar is_artist).
drop policy if exists "team_members owner write" on public.team_members;
create policy "team_members owner write" on public.team_members
  for update using (is_owner(team_id)) with check (is_owner(team_id));

-- 4b) LECTOR solo SELECT en contenido; escritura solo editor/owner.
--     (Repetir el patrón para cada tabla de contenido.)
-- artists
drop policy if exists "artists read"  on public.artists;
drop policy if exists "artists write" on public.artists;
create policy "artists read"  on public.artists for select using (is_member(team_id));
create policy "artists write" on public.artists for all
  using (is_editor(team_id)) with check (is_editor(team_id));

-- launches
drop policy if exists "launches read"  on public.launches;
drop policy if exists "launches write" on public.launches;
create policy "launches read"  on public.launches for select using (is_member(team_id));
create policy "launches write" on public.launches for all
  using (is_editor(team_id)) with check (is_editor(team_id));

-- banco (si tienes tabla 'banco'; si el banco vive dentro de artists/launches, omite)
-- drop policy if exists "banco read"  on public.banco;
-- drop policy if exists "banco write" on public.banco;
-- create policy "banco read"  on public.banco for select using (is_member(team_id));
-- create policy "banco write" on public.banco for all
--   using (is_editor(team_id)) with check (is_editor(team_id));

-- calendar (si tienes tabla 'calendar'; si vive dentro de launches.data, omite)
-- drop policy if exists "calendar read"  on public.calendar;
-- drop policy if exists "calendar write" on public.calendar;
-- create policy "calendar read"  on public.calendar for select using (is_member(team_id));
-- create policy "calendar write" on public.calendar for all
--   using (is_editor(team_id)) with check (is_editor(team_id));

-- NOTA: con `is_editor` en WRITE, mover artistas entre equipos (UPDATE team_id)
-- requiere que seas editor/owner en AMBOS equipos. Si quieres permitir mover siendo
-- solo miembro, usa is_member en el WITH CHECK del destino.
