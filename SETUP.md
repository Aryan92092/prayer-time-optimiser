# 🚀 HopePath — Complete Setup Guide (For New Machines)

This guide will walk you through setting up the **HopePath** project from a ZIP file on a fresh PC.

---

## 📋 Table of Contents
1. [Install Prerequisites](#1-install-prerequisites)
2. [Extract the Project](#2-extract-the-project)
3. [Database Setup (PostgreSQL)](#3-database-setup-postgresql)
4. [Backend Setup (Node.js)](#4-backend-setup-nodejs)
5. [AI Mood Engine Setup (Python)](#5-ai-mood-engine-setup-python)
6. [Frontend Setup (React)](#6-frontend-setup-react)
7. [Run All Services](#7-run-all-services)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Install Prerequisites

Download and install all of the following **before** doing anything else:

| Tool | Version | Download Link |
|---|---|---|
| **Node.js** | >= 18.x | https://nodejs.org/ |
| **Python** | >= 3.10 | https://python.org/ |
| **PostgreSQL** | >= 15 | https://www.postgresql.org/download/ |

> ⚠️ During PostgreSQL installation, you will be asked to set a **password for the `postgres` user**. Remember this password — you'll need it in Step 4.

---

## 2. Extract the Project

Unzip the project folder anywhere on your PC, for example:
```
C:\Projects\prayer_optimaztion\
```

You should see this structure inside:
```
prayer_optimaztion/
├── backend/
├── frontend/
├── ai-mood-engine/
├── README.md
└── SETUP.md   ← (this file)
```

---

## 3. Database Setup (PostgreSQL)

### Option A — Using pgAdmin (GUI, Recommended for Beginners)

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to your local server using your postgres password
3. Right-click **Databases** → **Create** → **Database**
4. Name it: `prayer_optimiser` → Click Save
5. Click on `prayer_optimiser` database → Open **Query Tool** (toolbar icon)
6. Copy and paste the **entire SQL below** into the Query Tool
7. Click the ▶️ **Run** button

### Option B — Using Terminal (psql)

Open a terminal and run:
```bash
psql -U postgres -c "CREATE DATABASE prayer_optimiser;"
psql -U postgres -d prayer_optimiser -f backend/src/schema.sql
```

---

### 📄 Database Schema SQL (Copy & Paste This into pgAdmin Query Tool)

```sql
-- ==========================================================
-- HopePath PostgreSQL Schema
-- ==========================================================

-- Cleanup (safe to re-run)
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.journals CASCADE;
DROP TABLE IF EXISTS public.mood_checkins CASCADE;
DROP TABLE IF EXISTS public.schedule_entries CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.password_resets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- USERS
CREATE TABLE public.users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PASSWORD RESET TOKENS
CREATE TABLE public.password_resets (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES public.users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES (public display info)
CREATE TABLE public.profiles (
  id         INT REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  role       TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROFILES (spiritual preferences)
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

-- PROGRAMS
CREATE TABLE public.programs (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  duration_type TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULE ENTRIES
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

-- JOURNALS
CREATE TABLE public.journals (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  program_id  INT REFERENCES public.programs(id) ON DELETE SET NULL,
  entry_text  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_type  TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- MOOD CHECK-INS
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
```

> ✅ After running this, you should see 8 tables created: `users`, `password_resets`, `profiles`, `user_profiles`, `programs`, `schedule_entries`, `journals`, `achievements`, `mood_checkins`

---

## 4. Backend Setup (Node.js)

Open a terminal, navigate into the `backend/` folder:

```bash
cd backend
npm install
```

### Create the `.env` file

Inside the `backend/` folder, create a new file called **`.env`** (no other extension) and paste this:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/prayer_optimiser
JWT_SECRET=hopepath_super_secret_key_2024
JWT_EXPIRES_IN=7d
```

> ⚠️ Replace `YOUR_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation.

### Start the backend:

```bash
npm run dev
```

✅ You should see: `Server running on port 5000`

---

## 5. AI Mood Engine Setup (Python)

Open a **new terminal**, navigate into the `ai-mood-engine/` folder:

```bash
cd ai-mood-engine
```

### Create a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

> You should see `(venv)` appear at the start of your terminal line.

### Install Python packages:

```bash
pip install -r requirements.txt
```

### Create the `.env` file

Inside `ai-mood-engine/`, create a file called **`.env`** and paste:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

> ⚠️ You need a valid OpenAI API key. Get one at: https://platform.openai.com/api-keys
> (Ask the project owner to share their key if you don't have one)

### Train the ML model (first time only):

```bash
python scripts/train_model.py
```

### Start the AI engine:

```bash
uvicorn api.main:app --reload --port 8000
```

✅ You should see: `Uvicorn running on http://127.0.0.1:8000`

---

## 6. Frontend Setup (React)

Open a **new terminal**, navigate into the `frontend/` folder:

```bash
cd frontend
npm install
```

### Create the `.env` file

Inside `frontend/`, create a file called **`.env`** and paste:

```env
VITE_API_URL=http://localhost:5000
VITE_AI_ENGINE_URL=http://localhost:8000
```

### Start the frontend:

```bash
npm run dev
```

✅ You should see: `Local: http://localhost:5173/`

---

## 7. Run All Services

You need **3 separate terminal windows** running at the same time:

| Terminal | Folder | Command |
|---|---|---|
| **Terminal 1** | `backend/` | `npm run dev` |
| **Terminal 2** | `ai-mood-engine/` | `uvicorn api.main:app --reload --port 8000` |
| **Terminal 3** | `frontend/` | `npm run dev` |

Then open your browser and go to:
## 👉 http://localhost:5173

---

## 8. Troubleshooting

### ❌ "Cannot connect to database"
- Make sure PostgreSQL service is running (search "Services" in Windows → find PostgreSQL → Start)
- Double-check your password in `backend/.env`
- Make sure the database name is exactly `prayer_optimiser` (with an `s`, not a `z`)

### ❌ "Module not found" (Node.js)
- Run `npm install` again inside the correct folder (`backend/` or `frontend/`)

### ❌ "ModuleNotFoundError" (Python)
- Make sure your virtual environment is activated: `venv\Scripts\activate`
- Run `pip install -r requirements.txt` again

### ❌ "OpenAI API error" or 401 Unauthorized
- Your OpenAI API key in `ai-mood-engine/.env` is missing or incorrect
- Make sure the key starts with `sk-`

### ❌ Frontend shows blank page or API errors
- Make sure both backend (port 5000) and AI engine (port 8000) are running before opening the frontend
- Check that `frontend/.env` has the correct URLs

---

## 📁 Summary of `.env` Files to Create

| File Location | Contents |
|---|---|
| `backend/.env` | `DATABASE_URL`, `JWT_SECRET`, `PORT` |
| `ai-mood-engine/.env` | `OPENAI_API_KEY` |
| `frontend/.env` | `VITE_API_URL`, `VITE_AI_ENGINE_URL` |

> ⚠️ These files are NOT included in the ZIP for security reasons. You must create them manually.

---

Made with ❤️ — HopePath Project
