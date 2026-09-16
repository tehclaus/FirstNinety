-- Ramp90 · Live mode schema
-- Run once in Supabase → SQL Editor → New query → Run

create table if not exists public.live_hires (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  template text not null,
  grade text not null,
  location text not null,
  work_mode text not null,
  manager text not null,
  buddy text not null,
  buddy_email text,
  start_date date not null,
  plan jsonb not null default '{}'::jsonb
);

create table if not exists public.live_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  hire_id uuid references public.live_hires(id) on delete cascade,
  channel text not null,          -- slack | calendar | gmail | notion
  action text not null,
  target text,
  preview text,
  status text not null default 'ok', -- ok | error | skipped
  error text
);

create table if not exists public.live_checkpoints (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hire_id uuid not null references public.live_hires(id) on delete cascade,
  day int not null check (day in (30, 60, 90)),
  answers jsonb not null default '{}'::jsonb,
  flag text,
  completed boolean not null default false,
  unique (hire_id, day)
);

-- Lock everything down: only the server (secret key) can read/write.
alter table public.live_hires enable row level security;
alter table public.live_events enable row level security;
alter table public.live_checkpoints enable row level security;
