-- ============================================================
--  elip resources — Supabase schema
--  Run this once in your Supabase project:
--  Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  name             text not null,
  whatsapp         text not null,
  email            text,
  role             text,               -- swe | pm | consulting | analyst | general
  source_page      text,              -- which community page they arrived on
  joined_community boolean default false
);

-- Row Level Security: allow anonymous visitors to INSERT their lead,
-- but never SELECT (so the lead list is not publicly readable).
alter table public.leads enable row level security;

drop policy if exists "anon can insert leads" on public.leads;
create policy "anon can insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- (No select/update/delete policy for anon → those are denied by default.)
-- View your leads any time in: Dashboard → Table Editor → leads
