
# 🕌 HopePath — AI-Powered Prayer & Spiritual Wellness Optimiser

**A full-stack intelligent wellness platform that blends spiritual practice with AI-driven mood analysis, personalized healing programs, and adaptive prayer scheduling.**


## 📖 Overview

**HopePath** is an AI-powered spiritual wellness application that helps users optimize their prayer routines and mental well-being. It combines:

- 🧠 **AI Mood Engine** — A Python/FastAPI microservice using scikit-learn to analyze user mood inputs and generate personalized spiritual wellness recommendations via OpenAI.
- 🛐 **Prayer Scheduler** — An adaptive prayer and daily activity planner tailored to the user's religion and schedule.
- 💬 **Dr. Aisha (AI Companion)** — An interactive conversational AI on the Healing page that provides context-aware responses.
- 📓 **Journaling & Achievements** — Track personal reflections and unlock milestone badges.
- 📊 **Mood Check-In Dashboard** — Visual analytics of spiritual, emotional, and sleep wellness over time.

---

## 🏗️ Architecture

```
prayer_optimaztion/
│
├── frontend/               # React 18 + Vite + TailwindCSS (UI layer)
│   └── src/
│       ├── pages/          # 13 page components (Dashboard, Healing, MoodCheckIn, etc.)
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context (Auth, etc.)
│       ├── hooks/          # Custom hooks
│       ├── services/       # Axios API service layer
│       └── lib/            # Utilities
│
├── backend/                # Node.js + Express REST API
│   └── src/
│       ├── index.js        # Entry point
│       ├── db.js           # PostgreSQL connection pool
│       ├── schema.sql      # Full database schema
│       ├── routes/         # API route handlers
│       └── middleware/     # Auth middleware (JWT)
│
└── ai-mood-engine/         # Python FastAPI microservice (ML + AI)
    ├── api/                # FastAPI route definitions
    ├── data/               # Training datasets
    ├── models/             # ML model artifacts
    ├── scripts/            # Training scripts
    ├── task_model/         # Saved task recommendation model
    └── requirements.txt    # Python dependencies
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Auth System** | JWT-based registration, login, email verification & password reset |
| 🧘 **Onboarding** | Religion/spirituality preference selection to personalize the experience |
| 📅 **Program Scheduler** | AI-generated daily prayer & spiritual activity programs (7/14/30-day) |
| 😊 **Mood Check-In** | 5-dimensional mood scoring (mood, sleep, spiritual, stress, hope) with trend charts |
| 🤖 **AI Mood Engine** | scikit-learn ML model + OpenAI to recommend healing tasks |
| 💊 **Healing Page** | Chat with Dr. Aisha (AI), select relief type (Humor, Quotes, Meditation) |
| 📓 **Journal** | Personal reflection entries linked to active programs |
| 🏆 **Achievements** | Badge system to reward spiritual milestones |
| 📄 **PDF Reports** | Export mood and progress reports using jsPDF |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router v6** for navigation
- **Axios** for HTTP requests
- **jsPDF** for report generation
- **SunCalc** for prayer time calculation

### Backend (Node.js)
- **Express.js** REST API
- **PostgreSQL** via `pg` driver
- **JWT** authentication (`jsonwebtoken`)
- **bcryptjs** for password hashing
- **dotenv** for environment config

### AI Mood Engine (Python)
- **FastAPI** microservice
- **scikit-learn** (ML model training & prediction)
- **OpenAI API** for LLM-powered recommendations
- **Pandas / NumPy** for data processing
- **Uvicorn** ASGI server

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org/) |
| Python | >= 3.10 | [python.org](https://python.org/) |
| PostgreSQL | >= 15 | [postgresql.org](https://www.postgresql.org/download/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/prayer-time-optimiser.git
cd prayer-time-optimiser
```

---

### 2️⃣ Database Setup (PostgreSQL)

1. Open **pgAdmin** or your terminal and create the database:

```sql
CREATE DATABASE prayer_optimiser;
```

2. Run the schema to create all tables:

```bash
psql -U postgres -d prayer_optimiser -f backend/src/schema.sql
```

> ✅ This will create all tables: `users`, `profiles`, `user_profiles`, `programs`, `schedule_entries`, `journals`, `achievements`, `mood_checkins`.

---

### 3️⃣ Backend Setup (Node.js / Express)

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
# backend/.env

PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/prayer_optimiser
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Optional: Email service for password reset
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start the backend server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

> The backend will run on **http://localhost:5000**

---

### 4️⃣ AI Mood Engine Setup (Python / FastAPI)

```bash
cd ai-mood-engine
```

Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `ai-mood-engine/`:

```env
# ai-mood-engine/.env

OPENAI_API_KEY=sk-your-openai-api-key-here
# OR if using OpenRouter:
OPENROUTER_API_KEY=your-openrouter-key-here
```

Train the ML models (if not already trained):

```bash
python scripts/train_model.py
```

Start the FastAPI server:

```bash
uvicorn api.main:app --reload --port 8000
```

> The AI engine will run on **http://localhost:8000**  
> API Docs available at **http://localhost:8000/docs**

---

### 5️⃣ Frontend Setup (React / Vite)

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
# frontend/.env

VITE_API_URL=http://localhost:5000
VITE_AI_ENGINE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

> The frontend will run on **http://localhost:5173**

---

## 🔄 Running All Services Together

Open **3 separate terminals** and run:

| Terminal | Directory | Command |
|---|---|---|
| 1 — Backend | `backend/` | `npm run dev` |
| 2 — AI Engine | `ai-mood-engine/` | `uvicorn api.main:app --reload --port 8000` |
| 3 — Frontend | `frontend/` | `npm run dev` |

Then open your browser at **http://localhost:5173** 🎉

---

## 📂 Environment Variables Summary

| File | Key Variables |
|---|---|
| `backend/.env` | `DATABASE_URL`, `JWT_SECRET`, `PORT` |
| `ai-mood-engine/.env` | `OPENAI_API_KEY` or `OPENROUTER_API_KEY` |
| `frontend/.env` | `VITE_API_URL`, `VITE_AI_ENGINE_URL` |

> ⚠️ **Never commit `.env` files to GitHub!** They are already included in `.gitignore`.

---

## 📸 Application Pages

| Page | Description |
|---|---|
| **Landing Page** | Intro and call-to-action |
| **Register / Login** | Secure user authentication |
| **Onboarding** | Religion & stress level personalization |
| **Dashboard** | Overview of program, mood trends, achievements |
| **Mood Check-In** | Multi-dimensional wellness scoring + AI analysis |
| **Healing Page** | Chat with Dr. Aisha AI + relief-type selector |
| **Task Details** | Deep-dive into daily spiritual activity guides |
| **Journal** | Personal reflection entries |
| **Profile** | User settings and preferences |

---

## 🧪 API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `GET` | `/api/profile` | Get user profile |
| `PUT` | `/api/profile` | Update user profile |
| `POST` | `/api/programs` | Create a new spiritual program |
| `GET` | `/api/programs/:id/schedule` | Get schedule for a program |
| `PATCH` | `/api/schedule/:id/complete` | Mark an activity as complete |
| `GET` | `/api/journals` | Get all journal entries |
| `POST` | `/api/journals` | Create a journal entry |
| `POST` | `/api/mood-checkins` | Submit a mood check-in |
| `GET` | `/api/mood-checkins` | Retrieve mood check-in history |
| `GET` | `/api/achievements` | Get user achievements |

---

Made with ❤️ and 🙏 to help people find peace through technology.
