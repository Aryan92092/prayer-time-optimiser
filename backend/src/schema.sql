-- ==========================================================
-- HopePath PostgreSQL Schema (pure PostgreSQL — no Supabase)
-- Run: psql -U postgres -d prayer_optimiser -f schema.sql
-- ==========================================================

-- Cleanup (safe re-run)
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.journals CASCADE;
DROP TABLE IF EXISTS public.mood_checkins CASCADE;
DROP TABLE IF EXISTS public.schedule_entries CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.password_resets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ==========================================================
-- USERS (replaces Supabase auth.users)
-- ==========================================================
CREATE TABLE public.users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- PASSWORD RESET TOKENS
-- ==========================================================
CREATE TABLE public.password_resets (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES public.users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- PROFILES (public display info)
-- ==========================================================
CREATE TABLE public.profiles (
  id         INT REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  role       TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- USER PROFILES (spiritual preferences)
-- ==========================================================
CREATE TABLE public.user_profiles (
  id                   SERIAL PRIMARY KEY,
  user_id              INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stress_level         TEXT NOT NULL,
  overwhelm_reason     TEXT,
  spiritual_preference TEXT NOT NULL,
  religion_type        TEXT,
  user_role            TEXT NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- PROGRAMS
-- ==========================================================
CREATE TABLE public.programs (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  duration_type TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- SCHEDULE ENTRIES
-- ==========================================================
CREATE TABLE public.schedule_entries (
  id                   SERIAL PRIMARY KEY,
  program_id           INT REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  user_id              INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  day_number           INTEGER NOT NULL,
  time_of_day          TEXT NOT NULL,
  activity_title       TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  reference            TEXT,
  detail_guide         JSONB,
  mantra_lyrics        TEXT,
  completed            BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- JOURNALS
-- ==========================================================
CREATE TABLE public.journals (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  program_id  INT REFERENCES public.programs(id) ON DELETE SET NULL,
  entry_text  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- ACHIEVEMENTS
-- ==========================================================
CREATE TABLE public.achievements (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_type  TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- ==========================================================
-- MOOD CHECK-INS
-- ==========================================================
CREATE TABLE public.mood_checkins (
  id               SERIAL PRIMARY KEY,
  user_id          INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mood_score       INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  sleep_score      INTEGER NOT NULL CHECK (sleep_score BETWEEN 1 AND 5),
  spiritual_score  INTEGER NOT NULL CHECK (spiritual_score BETWEEN 1 AND 5),
  stress_score     INTEGER NOT NULL CHECK (stress_score BETWEEN 1 AND 5),
  hope_score       INTEGER NOT NULL CHECK (hope_score BETWEEN 1 AND 5),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
