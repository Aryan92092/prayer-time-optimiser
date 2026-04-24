const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── GET /api/v1/profile ───────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT p.id, p.name, p.email, p.role, p.created_at,
              up.stress_level, up.overwhelm_reason, up.spiritual_preference,
              up.religion_type, up.user_role AS spiritual_role
       FROM profiles p
       LEFT JOIN user_profiles up ON up.user_id = p.id
       WHERE p.id = $1`,
            [req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Profile not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('Get profile error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── PUT /api/v1/profile ───────────────────────────────────
router.put('/', async (req, res) => {
    const { name, role } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE profiles SET name = COALESCE($1, name), role = COALESCE($2, role) WHERE id = $3 RETURNING *',
            [name, role, req.user.id]
        );
        return res.json(rows[0]);
    } catch (err) {
        console.error('Update profile error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── PUT /api/v1/profile/spiritual ────────────────────────
router.put('/spiritual', async (req, res) => {
    const { stress_level, overwhelm_reason, spiritual_preference, religion_type, user_role, spiritual_role } = req.body;
    const roleToSave = user_role || spiritual_role || 'seeker';

    try {
        const { rows } = await pool.query(
            `INSERT INTO user_profiles (user_id, stress_level, overwhelm_reason, spiritual_preference, religion_type, user_role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         stress_level = EXCLUDED.stress_level,
         overwhelm_reason = EXCLUDED.overwhelm_reason,
         spiritual_preference = EXCLUDED.spiritual_preference,
         religion_type = EXCLUDED.religion_type,
         user_role = EXCLUDED.user_role
       RETURNING *`,
            [req.user.id, stress_level, overwhelm_reason, spiritual_preference, religion_type, roleToSave]
        );
        return res.json(rows[0]);
    } catch (err) {
        console.error('Update spiritual profile error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── GET /api/v1/profile/activity ────────────────────────
router.get('/activity', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT 'mood' as type, 'Completed Mood Check-in' as title, created_at as date 
             FROM mood_checkins 
             WHERE user_id = $1
             UNION ALL 
             SELECT 'journal' as type, 'Wrote a Journal Entry' as title, created_at as date 
             FROM journals 
             WHERE user_id = $1
             UNION ALL
             SELECT 'schedule' as type, 'Completed ' || activity_title as title, created_at as date
             FROM schedule_entries
             WHERE user_id = $1 AND completed = true
             ORDER BY date DESC 
             LIMIT 5`,
            [req.user.id]
        );
        return res.json(rows);
    } catch (err) {
        console.error('Get activity error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
