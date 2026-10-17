-- =====================================================================
--  FUZE ARENA — journal de combat, paris et raid (à lancer une fois)
-- =====================================================================

-- ---------- Journal des combats (pour revoir, se venger, partager) ----------
create table if not exists public.fight_log (
  id bigint generated always as identity primary key,
  attacker_id uuid not null default auth.uid() references auth.users on delete cascade,
  defender_id uuid references auth.users on delete cascade,
  attacker_name text not null,
  defender_name text not null,
  kind text not null,
  winner smallint not null,
  seed bigint not null,
  a_snap jsonb not null,
  d_snap jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists fight_log_def on public.fight_log (defender_id, created_at desc);
create index if not exists fight_log_att on public.fight_log (attacker_id, created_at desc);
alter table public.fight_log enable row level security;
create policy "lire le journal" on public.fight_log for select to authenticated using (true);
create policy "ecrire ses combats" on public.fight_log for insert to authenticated with check (attacker_id = auth.uid());

-- ---------- Défis et paris ----------
create table if not exists public.challenges (
  id bigint generated always as identity primary key,
  from_id uuid not null default auth.uid() references auth.users on delete cascade,
  to_id uuid not null references auth.users on delete cascade,
  from_name text not null,
  to_name text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  from_snap jsonb,
  to_snap jsonb,
  seed bigint
);
alter table public.challenges enable row level security;
create policy "lire les defis" on public.challenges for select to authenticated using (true);
create policy "lancer un defi" on public.challenges for insert to authenticated
  with check (from_id = auth.uid() and status = 'pending' and from_id <> to_id);
create policy "repondre a un defi" on public.challenges for update to authenticated
  using (status = 'pending' and (to_id = auth.uid() or from_id = auth.uid()))
  with check (to_id = auth.uid() or from_id = auth.uid());

create table if not exists public.wagers (
  id bigint generated always as identity primary key,
  challenge_id bigint not null references public.challenges on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  pseudo text not null,
  side smallint not null check (side in (0, 1)),
  amount integer not null check (amount between 1 and 1000),
  odds numeric not null check (odds between 1 and 20),
  created_at timestamptz not null default now()
);
alter table public.wagers enable row level security;
create policy "lire les paris" on public.wagers for select to authenticated using (true);
-- On ne peut miser que pour soi, et seulement pendant les 24 h qui suivent l'acceptation du défi
create policy "miser" on public.wagers for insert to authenticated with check (
  user_id = auth.uid() and exists (
    select 1 from public.challenges c
    where c.id = challenge_id and c.status = 'accepted' and c.accepted_at > now() - interval '1 day'
  )
);

-- ---------- Raid de la semaine ----------
create table if not exists public.raids (
  week text primary key,
  boss text not null,
  hp bigint not null check (hp > 0),
  level integer not null,
  created_at timestamptz not null default now()
);
alter table public.raids enable row level security;
create policy "lire les raids" on public.raids for select to authenticated using (true);
create policy "ouvrir le raid" on public.raids for insert to authenticated with check (true);

create table if not exists public.raid_hits (
  id bigint generated always as identity primary key,
  week text not null references public.raids on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  pseudo text not null,
  damage integer not null check (damage >= 0),
  created_at timestamptz not null default now()
);
create index if not exists raid_hits_week on public.raid_hits (week);
alter table public.raid_hits enable row level security;
create policy "lire les coups" on public.raid_hits for select to authenticated using (true);
create policy "frapper le boss" on public.raid_hits for insert to authenticated with check (user_id = auth.uid());

-- En direct : nouvelles attaques reçues, défis et paris
alter publication supabase_realtime add table public.fight_log, public.challenges, public.wagers, public.raid_hits;
