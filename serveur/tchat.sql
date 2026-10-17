-- =====================================================================
--  FUZE ARENA — tchat entre joueurs (à lancer une fois dans « SQL Editor »)
-- =====================================================================

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  pseudo text not null,
  text text not null check (char_length(text) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at on public.messages (created_at desc);

alter table public.messages enable row level security;

-- Tous les joueurs connectés lisent le tchat
create policy "lire le tchat" on public.messages
  for select to authenticated using (true);

-- On ne peut écrire qu'en son nom (avec son vrai pseudo)
create policy "ecrire dans le tchat" on public.messages
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and pseudo = (select a.pseudo from public.accounts a where a.id = auth.uid())
  );

-- Les nouveaux messages arrivent en direct sur les téléphones
alter publication supabase_realtime add table public.messages;
