-- ── Run this in Supabase SQL Editor ──────────────────────────────────────────
--
-- IMPORTANT: Before running, go to:
--   Supabase Dashboard → Authentication → Providers → Email
--   → turn OFF "Confirm email"
--   This lets users sign up with a PIN without needing an email link.
--
-- ── User profiles ─────────────────────────────────────────────────────────────

create table if not exists profiles (
  id       uuid references auth.users on delete cascade primary key,
  username text unique not null,
  role     text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- ── Saved videos (per user) ───────────────────────────────────────────────────

create table if not exists saved_videos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade not null,
  youtube_id text not null,
  saved_at   timestamptz default now(),
  unique(user_id, youtube_id)
);

alter table saved_videos enable row level security;

create policy "Users manage own saves"
  on saved_videos using (auth.uid() = user_id);

create policy "Users insert saves"
  on saved_videos for insert with check (auth.uid() = user_id);

-- ── Reflections (per user) ────────────────────────────────────────────────────

create table if not exists reflections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  youtube_id  text,
  video_title text,
  text        text not null,
  created_at  timestamptz default now()
);

alter table reflections enable row level security;

create policy "Users manage own reflections"
  on reflections using (auth.uid() = user_id);

create policy "Users insert reflections"
  on reflections for insert with check (auth.uid() = user_id);

-- ── Tighten videos table: only admins can insert/update/delete ───────────────

drop policy if exists "Admin insert" on videos;
drop policy if exists "Admin update" on videos;
drop policy if exists "Admin delete" on videos;

create policy "Admin insert"
  on videos for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin update"
  on videos for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin delete"
  on videos for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Auto-create profile on sign-up (bypasses RLS timing issue) ───────────────
-- security definer runs as the function owner (postgres), not the calling user,
-- so auth.uid() being null right after signUp() doesn't matter.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    split_part(new.email, '@', 1),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── To promote a user to admin ────────────────────────────────────────────────
-- update profiles set role = 'admin' where username = 'your_username';
