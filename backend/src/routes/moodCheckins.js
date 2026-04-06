const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── POST /api/v1/mood-checkins ─────────────────────────────
// Save a new mood check-in for the authenticated user
router.post('/', async (req, res) => {
    const { mood_score, sleep_score, spiritual_score, stress_score, hope_score } = req.body;
    if (
        mood_score == null || sleep_score == null || spiritual_score == null ||
        stress_score == null || hope_score == null
    ) {
        return res.status(400).json({ error: 'All score fields are required.' });
    }
    try {
        const { rows } = await pool.query(
            `INSERT INTO mood_checkins (user_id, mood_score, sleep_score, spiritual_score, stress_score, hope_score)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user.id, mood_score, sleep_score, spiritual_score, stress_score, hope_score]
        );
        return res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Save mood check-in error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── GET /api/v1/mood-checkins ──────────────────────────────
// Get all check-ins for the authenticated user
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM mood_checkins WHERE user_id = $1 ORDER BY created_at ASC',
            [req.user.id]
        );
        return res.json(rows);
    } catch (err) {
        console.error('Get mood check-ins error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── GET /api/v1/mood-checkins/last ────────────────────────
// Get only the latest check-in for the authenticated user
router.get('/last', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM mood_checkins WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [req.user.id]
        );
        return res.json(rows[0] || null);
    } catch (err) {
        console.error('Get last mood check-in error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
