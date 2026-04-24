-- Run this in your Supabase project: Dashboard → SQL Editor → New query

create table if not exists videos (
  id          uuid        primary key default gen_random_uuid(),
  youtube_id  text        unique not null,
  title       text        not null,
  source      text        not null,
  category    text        not null check (category in ('quran','hadith','spiritual','discipline','family','income','growth')),
  description text        not null,
  duration    text        not null,
  language    text        not null default 'en' check (language in ('en', 'ar')),
  created_at  timestamptz default now()
);

-- Allow anyone to read videos (public feed)
alter table videos enable row level security;

create policy "Public read"
  on videos for select
  using (true);

-- Only the service role key (used by curate script) can insert
-- No insert policy needed — service role bypasses RLS by default
