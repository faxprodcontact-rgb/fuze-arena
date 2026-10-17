-- =====================================================================
--  FUZE ARENA — installation de la base de données (Supabase)
--  À coller en entier dans « SQL Editor » puis cliquer sur « Run ».
-- =====================================================================

-- Une ligne par joueur : son pseudo et toute sa progression
create table if not exists public.accounts (
  id uuid primary key references auth.users on delete cascade,
  pseudo text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

-- Tout joueur connecté peut voir les autres (combats, guerre, classement)
drop policy if exists "lecture joueurs" on public.accounts;
create policy "lecture joueurs" on public.accounts
  for select to authenticated using (true);

-- Chacun ne peut créer et modifier QUE son propre compte
drop policy if exists "creer son compte" on public.accounts;
create policy "creer son compte" on public.accounts
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "modifier son compte" on public.accounts;
create policy "modifier son compte" on public.accounts
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- 8 joueurs maximum
create or replace function public.limit_accounts() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.accounts) >= 8 then
    raise exception 'Le jeu est complet (8 joueurs maximum)';
  end if;
  return new;
end $$;

drop trigger if exists limit_accounts on public.accounts;
create trigger limit_accounts before insert on public.accounts
  for each row execute function public.limit_accounts();

-- Nombre de joueurs inscrits (lisible avant de se connecter)
create or replace function public.player_count() returns integer
language sql security definer set search_path = public as $$
  select count(*)::integer from public.accounts;
$$;
grant execute on function public.player_count() to anon, authenticated;
