-- Baby Bets Consumer App — Initial Schema
-- Supabase project: personal-shared (pxevaaqtducqbivbsqfp)

-- Users table (extends Supabase Auth)
create table if not exists public.bb_users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pools table
create table if not exists public.bb_pools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  baby_name text not null,
  due_date date not null,
  host_display_name text not null,
  enabled_categories text[] not null default array['gender','birthday','birth_time','weight','length','hair_amount','hair_color','eye_color','name'],
  predictions_locked boolean not null default false,
  revealed boolean not null default false,
  share_code text unique not null,
  created_at timestamptz not null default now()
);

-- Pool hosts (join table for multi-host support)
create table if not exists public.bb_pool_hosts (
  pool_id uuid not null references public.bb_pools(id) on delete cascade,
  user_id uuid not null references public.bb_users(id) on delete cascade,
  role text not null check (role in ('creator', 'co-parent')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (pool_id, user_id)
);

-- Pool settings (actual birth stats, 1:1 with pools)
create table if not exists public.bb_pool_settings (
  pool_id uuid primary key references public.bb_pools(id) on delete cascade,
  actual_gender text check (actual_gender in ('Boy', 'Girl')),
  actual_birthday date,
  actual_birth_time time,
  actual_weight_lbs integer check (actual_weight_lbs between 1 and 15),
  actual_weight_oz integer check (actual_weight_oz between 0 and 15),
  actual_length_inches decimal check (actual_length_inches between 10 and 30),
  actual_hair_amount text check (actual_hair_amount in ('Bald', 'Peach fuzz', 'Some hair', 'Full head')),
  actual_hair_color text check (actual_hair_color in ('Brown', 'Blonde', 'Black', 'Red')),
  actual_eye_color text check (actual_eye_color in ('Brown', 'Blue', 'Green', 'Hazel', 'Gray')),
  actual_name text,
  photo_urls text[] default array[]::text[],
  announcement_message text
);

-- Predictions (guest submissions)
create table if not exists public.bb_predictions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.bb_pools(id) on delete cascade,
  guest_name text not null,
  guest_email text,
  guest_phone text,
  short_code text unique not null,
  gender_guess text check (gender_guess in ('Boy', 'Girl')),
  birthday date,
  birth_time time,
  weight_lbs integer check (weight_lbs between 1 and 15),
  weight_oz integer check (weight_oz between 0 and 15),
  length_inches decimal check (length_inches between 10 and 30),
  hair_amount text check (hair_amount in ('Bald', 'Peach fuzz', 'Some hair', 'Full head')),
  hair_color text check (hair_color in ('Brown', 'Blonde', 'Black', 'Red')),
  eye_color text check (eye_color in ('Brown', 'Blue', 'Green', 'Hazel', 'Gray')),
  name_guess text,
  created_at timestamptz not null default now()
);

-- Invites (tracking)
create table if not exists public.bb_invites (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.bb_pools(id) on delete cascade,
  channel text not null check (channel in ('link', 'qr', 'email', 'share_sheet')),
  recipient text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_bb_pools_slug on public.bb_pools(slug);
create index if not exists idx_bb_pools_share_code on public.bb_pools(share_code);
create index if not exists idx_bb_predictions_pool_id on public.bb_predictions(pool_id);
create index if not exists idx_bb_predictions_short_code on public.bb_predictions(short_code);
create index if not exists idx_bb_pool_hosts_user_id on public.bb_pool_hosts(user_id);
create index if not exists idx_bb_invites_pool_id on public.bb_invites(pool_id);

-- Row Level Security
alter table public.bb_users enable row level security;
alter table public.bb_pools enable row level security;
alter table public.bb_pool_hosts enable row level security;
alter table public.bb_pool_settings enable row level security;
alter table public.bb_predictions enable row level security;
alter table public.bb_invites enable row level security;

-- bb_users: users can read/update their own row
create policy "Users can read own profile"
  on public.bb_users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.bb_users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.bb_users for insert
  with check (auth.uid() = id);

-- bb_pools: anyone can read (public pool pages), hosts can update
create policy "Anyone can read pools"
  on public.bb_pools for select
  using (true);

create policy "Hosts can insert pools"
  on public.bb_pools for insert
  with check (
    auth.uid() in (select user_id from public.bb_pool_hosts where pool_id = id)
    or auth.role() = 'service_role'
  );

create policy "Hosts can update own pools"
  on public.bb_pools for update
  using (
    exists (
      select 1 from public.bb_pool_hosts
      where pool_id = bb_pools.id and user_id = auth.uid()
    )
  );

create policy "Creators can delete own pools"
  on public.bb_pools for delete
  using (
    exists (
      select 1 from public.bb_pool_hosts
      where pool_id = bb_pools.id and user_id = auth.uid() and role = 'creator'
    )
  );

-- bb_pool_hosts: hosts can read their own memberships, service role for inserts
create policy "Users can read own host memberships"
  on public.bb_pool_hosts for select
  using (user_id = auth.uid());

create policy "Hosts can read pool co-hosts"
  on public.bb_pool_hosts for select
  using (
    pool_id in (select pool_id from public.bb_pool_hosts h where h.user_id = auth.uid())
  );

create policy "Service role manages pool hosts"
  on public.bb_pool_hosts for all
  using (auth.role() = 'service_role');

-- bb_pool_settings: anyone can read when revealed, hosts can read always, hosts can update
create policy "Anyone can read revealed settings"
  on public.bb_pool_settings for select
  using (
    exists (select 1 from public.bb_pools where id = pool_id and revealed = true)
  );

create policy "Hosts can read own pool settings"
  on public.bb_pool_settings for select
  using (
    exists (
      select 1 from public.bb_pool_hosts
      where pool_id = bb_pool_settings.pool_id and user_id = auth.uid()
    )
  );

create policy "Hosts can update own pool settings"
  on public.bb_pool_settings for update
  using (
    exists (
      select 1 from public.bb_pool_hosts
      where pool_id = bb_pool_settings.pool_id and user_id = auth.uid()
    )
  );

create policy "Service role manages pool settings"
  on public.bb_pool_settings for all
  using (auth.role() = 'service_role');

-- bb_predictions: anyone can insert (when not locked), anyone can read when revealed, hosts can read always
create policy "Anyone can insert predictions when not locked"
  on public.bb_predictions for insert
  with check (
    exists (select 1 from public.bb_pools where id = pool_id and predictions_locked = false)
  );

create policy "Anyone can read predictions when revealed"
  on public.bb_predictions for select
  using (
    exists (select 1 from public.bb_pools where id = pool_id and revealed = true)
  );

create policy "Hosts can read own pool predictions"
  on public.bb_predictions for select
  using (
    exists (
      select 1 from public.bb_pool_hosts
      where pool_id = bb_predictions.pool_id and user_id = auth.uid()
    )
  );

create policy "Anyone can read own prediction by short_code"
  on public.bb_predictions for select
  using (true);

-- bb_invites: hosts can read/insert for their pools
create policy "Hosts can manage invites"
  on public.bb_invites for all
  using (
    exists (
      select 1 from public.bb_pool_hosts
      where pool_id = bb_invites.pool_id and user_id = auth.uid()
    )
  );

create policy "Service role manages invites"
  on public.bb_invites for all
  using (auth.role() = 'service_role');

-- Function to auto-create bb_users row on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.bb_users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to auto-create pool_settings row when pool is created
create or replace function public.handle_new_pool()
returns trigger as $$
begin
  insert into public.bb_pool_settings (pool_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_pool_created on public.bb_pools;
create trigger on_pool_created
  after insert on public.bb_pools
  for each row execute procedure public.handle_new_pool();
