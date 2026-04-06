const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── GET /api/v1/journals ──────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM journals WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        return res.json(rows);
    } catch (err) {
        console.error('Get journals error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/v1/journals ─────────────────────────────────
router.post('/', async (req, res) => {
    const { entry_text, program_id } = req.body;
    if (!entry_text) return res.status(400).json({ error: 'entry_text is required.' });

    try {
        const { rows } = await pool.query(
            'INSERT INTO journals (user_id, program_id, entry_text) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, program_id || null, entry_text]
        );
        return res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Create journal error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── DELETE /api/v1/journals/:id ───────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await pool.query(
            'DELETE FROM journals WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (rowCount === 0) return res.status(404).json({ error: 'Journal entry not found.' });
        return res.json({ message: 'Deleted.' });
    } catch (err) {
        console.error('Delete journal error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
