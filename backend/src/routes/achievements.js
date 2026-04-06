const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── GET /api/v1/achievements ──────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM achievements WHERE user_id = $1 ORDER BY unlocked_at ASC',
            [req.user.id]
        );
        return res.json(rows);
    } catch (err) {
        console.error('Get achievements error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/v1/achievements ─────────────────────────────
// Body: { badge_type }  — upserts (ignores if already unlocked)
router.post('/', async (req, res) => {
    const { badge_type } = req.body;
    if (!badge_type) return res.status(400).json({ error: 'badge_type is required.' });

    try {
        const { rows } = await pool.query(
            `INSERT INTO achievements (user_id, badge_type)
       VALUES ($1, $2)
       ON CONFLICT (user_id, badge_type) DO NOTHING
       RETURNING *`,
            [req.user.id, badge_type]
        );
        return res.status(201).json(rows[0] || { message: 'Already unlocked.' });
    } catch (err) {
        console.error('Unlock achievement error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
