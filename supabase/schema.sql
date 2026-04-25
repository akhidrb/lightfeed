-- ── Initial setup (run once) ──────────────────────────────────────────────────
-- Dashboard → SQL Editor → New query

create table if not exists videos (
  id          uuid        primary key default gen_random_uuid(),
  youtube_id  text        unique not null,
  title       text        not null,
  source      text        not null,
  category    text        not null,
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

-- Only the service role key (used by the curate script) can insert/update.
-- The service role bypasses RLS by default — no extra policy needed.


-- ── Migration: run if table already exists ────────────────────────────────────
-- Drops the old strict category check so new categories are accepted.
-- Safe to run even if there was no previous constraint.

alter table videos drop constraint if exists videos_category_check;
