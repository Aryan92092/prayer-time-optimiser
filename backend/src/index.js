require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/profile', require('./routes/profile'));
app.use('/api/v1/programs', require('./routes/programs'));
app.use('/api/v1/entries', require('./routes/scheduleEntries'));
app.use('/api/v1/journals', require('./routes/journals'));
app.use('/api/v1/achievements', require('./routes/achievements'));
app.use('/api/v1/mood-checkins', require('./routes/moodCheckins'));

// ── Health check ──────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// ── 404 Fallback ──────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 HopePath API running on port ${PORT}`));
