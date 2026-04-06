const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── PATCH /api/v1/entries/:id ─────────────────────────────
// Body: { completed: true | false }
router.patch('/:id', async (req, res) => {
    const { completed } = req.body;
    if (typeof completed !== 'boolean')
        return res.status(400).json({ error: 'completed (boolean) is required.' });

    try {
        const { rows } = await pool.query(
            `UPDATE schedule_entries SET completed = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
            [completed, req.params.id, req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Entry not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('Update entry error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
