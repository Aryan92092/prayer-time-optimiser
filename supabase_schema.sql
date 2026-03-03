-- ==========================================================
-- HopePath Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ==========================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text,
  role text default 'user',
  created_at timestamptz default now()
);

-- ==========================================================
-- USER PROFILES (spiritual preferences)
-- ==========================================================
create table if not exists public.user_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stress_level text not null,
  overwhelm_reason text,
  spiritual_preference text not null,
  religion_type text,
  user_role text not null,
  created_at timestamptz default now()
);

-- ==========================================================
-- PROGRAMS
-- ==========================================================
create table if not exists public.programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  duration_type text not null,
  status text not null default 'active',
  created_at timestamptz default now()
);

-- ==========================================================
-- SCHEDULE ENTRIES
-- ==========================================================
create table if not exists public.schedule_entries (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  day_number integer not null,
  time_of_day text not null,
  activity_title text not null,
  activity_description text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- ==========================================================
-- JOURNALS
-- ==========================================================
create table if not exists public.journals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  program_id uuid references public.programs(id) on delete set null,
  entry_text text not null,
  created_at timestamptz default now()
);

-- ==========================================================
-- ACHIEVEMENTS
-- ==========================================================
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_type text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_type)
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) — Users can only see their own data
-- ==========================================================
alter table public.profiles enable row level security;
alter table public.user_profiles enable row level security;
alter table public.programs enable row level security;
alter table public.schedule_entries enable row level security;
alter table public.journals enable row level security;
alter table public.achievements enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- User profiles policies
create policy "Users manage own user_profile" on public.user_profiles for all using (auth.uid() = user_id);

-- Programs policies
create policy "Users manage own programs" on public.programs for all using (auth.uid() = user_id);

-- Schedule entries policies
create policy "Users manage own entries" on public.schedule_entries for all using (auth.uid() = user_id);

-- Journals policies
create policy "Users manage own journals" on public.journals for all using (auth.uid() = user_id);

-- Achievements policies
create policy "Users manage own achievements" on public.achievements for all using (auth.uid() = user_id);

-- ==========================================================
-- TRIGGER: auto-create profile row on signup
-- ==========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
