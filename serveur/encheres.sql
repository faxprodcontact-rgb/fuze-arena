-- =====================================================================
--  ENCHÈRES (boutique) — à lancer UNE fois dans Supabase (SQL Editor),
--  le jour de la sortie de Fuze Arena 2.0, avec l'accord du propriétaire.
--  Chaque joueur met 1 objet en vente à la fois, pendant 24 h ; il part au plus offrant.
--  Le Flouze et les objets sont réglés par le jeu de chaque joueur (comme les paris).
-- =====================================================================

create table if not exists public.auctions (
  id bigint generated always as identity primary key,
  seller_id uuid not null default auth.uid() references auth.users on delete cascade,
  pseudo text not null,
  hero_id text not null,
  item_id text not null,
  rarity smallint not null check (rarity between 0 and 6),
  min_price integer not null check (min_price between 1 and 100000),
  created_at timestamptz not null default now()
);
alter table public.auctions enable row level security;
create policy "lire les enchères" on public.auctions for select to authenticated using (true);
-- On ne vend que pour soi, une seule vente en cours à la fois, et l'heure de départ est celle du serveur
create policy "mettre en vente" on public.auctions for insert to authenticated with check (
  seller_id = auth.uid()
  and created_at between now() - interval '1 minute' and now() + interval '1 minute'
  and not exists (
    select 1 from public.auctions a
    where a.seller_id = auth.uid() and a.created_at > now() - interval '24 hours'
  )
);

create table if not exists public.bids (
  id bigint generated always as identity primary key,
  auction_id bigint not null references public.auctions on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  pseudo text not null,
  amount integer not null check (amount between 1 and 100000),
  created_at timestamptz not null default now()
);
alter table public.bids enable row level security;
create policy "lire les offres" on public.bids for select to authenticated using (true);
-- On n'enchérit que pour soi, pas sur sa propre vente, pendant les 24 h, au moins le prix de départ
-- et plus que la meilleure offre
create policy "enchérir" on public.bids for insert to authenticated with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.auctions a
    where a.id = auction_id and a.seller_id <> auth.uid()
      and a.created_at > now() - interval '24 hours'
      and amount >= a.min_price
  )
  and amount > coalesce((select max(b.amount) from public.bids b where b.auction_id = bids.auction_id), 0)
);

alter publication supabase_realtime add table public.auctions, public.bids;
