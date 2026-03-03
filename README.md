# HopePath: Premium Spiritual & Mental Wellness Platform

HopePath is an industrial-grade "Spiritual Glow" SaaS platform designed to help users navigate difficult life phases through personalized routines, divine insights, and expressive journaling.

## ✨ Premium Features
- **Divine Dashboard**: Real-time analytics, daily focus cards with "Spiritual Glow" effects, and dynamic progress tracking.
- **Personalized Hope Schedules**: Dynamically generated routines tailored to 4 religions (Hindu, Muslim, Sikh, Christian) or a Mindful/Non-Religious path.
- **Sanctuary Journaling**: An immersive, glassmorphic journaling experience with a chronological growth timeline.
- **Adaptive Design**: A high-end, responsive UI featuring animated mesh gradients, premium glassmorphism, and a seamless Dark/Light mode engine.
- **Profile Sanctuary**: Manage your spiritual path, role, and personal settings in a dedicated premium space.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS (Custom Spiritual Design System), Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, PostgreSQL (Raw SQL for performance), JWT Security.

## 🚀 Rapid Setup

### 1. Database Initialization
1. Create a PostgreSQL database named `prayer_optimiser`.
2. Execute the schema: `psql -d prayer_optimiser -f backend/src/models/schema.sql`.

### 2. Backend Orchestration
```bash
cd backend
npm install
# Configure .env with DATABASE_URL, JWT_SECRET, and CORS_ORIGIN
npm run seed  # Populates 180+ personalized spiritual activities
npm start
```

### 3. Frontend Activation
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Configuration
### Backend (.env)
- `PORT`: 5000 (Default)
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure key for session management.
- `CORS_ORIGIN`: `http://localhost:5173,http://localhost:5174` (Supports multiple dev ports).

### Frontend
- Configure `VITE_API_URL` to point to your backend (Defaults to `http://localhost:5000/api/v1`).

---

## 💎 Industry Standards
Every component in HopePath has been built with scalability and premium aesthetics in mind. The "Spiritual Glow" design system uses a curated palette of Saffron, Divine Purple, and Teal Aurora to ensure a calming yet professional user experience.
