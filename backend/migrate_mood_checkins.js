require('dotenv').config();
const pool = require('./src/db');

const createTable = `
  CREATE TABLE IF NOT EXISTS public.mood_checkins (
    id               SERIAL PRIMARY KEY,
    user_id          INT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    mood_score       INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
    sleep_score      INTEGER NOT NULL CHECK (sleep_score BETWEEN 1 AND 5),
    spiritual_score  INTEGER NOT NULL CHECK (spiritual_score BETWEEN 1 AND 5),
    stress_score     INTEGER NOT NULL CHECK (stress_score BETWEEN 1 AND 5),
    hope_score       INTEGER NOT NULL CHECK (hope_score BETWEEN 1 AND 5),
    created_at       TIMESTAMPTZ DEFAULT NOW()
  );
`;

(async () => {
    try {
        await pool.query(createTable);
        console.log('✅ mood_checkins table created (or already exists).');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
})();
