-- ============================================================
-- E-Tafatafa — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Users (profile) table ── --
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  username    text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ── 2. Messages table ── --
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  content    text,
  audio_url  text,
  is_edited  boolean not null default false,
  created_at timestamptz not null default now(),
  -- Ensure every message has at least content OR audio
  constraint has_content check (content is not null or audio_url is not null)
);

-- ── 3. Reactions table ── --
create table if not exists public.reactions (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references public.messages(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  emoji       text not null,
  created_at  timestamptz not null default now(),
  -- Each user can only add a given emoji once per message
  unique(message_id, user_id, emoji)
);

-- ── Indexes ── --
create index if not exists messages_created_at_idx on public.messages(created_at desc);
create index if not exists reactions_message_id_idx on public.reactions(message_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- users --
alter table public.users enable row level security;

create policy "Users can read all profiles"
  on public.users for select
  to authenticated
  using (true);

create policy "Users can upsert their own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id);

-- messages --
alter table public.messages enable row level security;

create policy "Authenticated users can read messages"
  on public.messages for select
  to authenticated
  using (true);

create policy "Authenticated users can insert messages"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Authors can update their own messages"
  on public.messages for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Authors can delete their own messages"
  on public.messages for delete
  to authenticated
  using (auth.uid() = user_id);

-- reactions --
alter table public.reactions enable row level security;

create policy "Authenticated users can read reactions"
  on public.reactions for select
  to authenticated
  using (true);

create policy "Authenticated users can add reactions"
  on public.reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove their own reactions"
  on public.reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Realtime: enable publications for tables
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.reactions;

-- ============================================================
-- Storage: voice-messages bucket
-- Run in SQL Editor or create via Dashboard → Storage
-- ============================================================
insert into storage.buckets (id, name, public)
  values ('voice-messages', 'voice-messages', true)
  on conflict (id) do nothing;

-- Storage policies
create policy "Authenticated users can upload voice messages"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'voice-messages' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can read voice messages"
  on storage.objects for select
  to public
  using (bucket_id = 'voice-messages');

create policy "Users can delete their own voice messages"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'voice-messages' and auth.uid()::text = (storage.foldername(name))[1]);
