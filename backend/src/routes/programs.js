const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── POST /api/v1/programs ─────────────────────────────────
// Body: { start_date, end_date, duration_type, entries: [...] }
router.post('/', async (req, res) => {
    const { start_date, end_date, duration_type, entries } = req.body;
    if (!start_date || !end_date || !duration_type)
        return res.status(400).json({ error: 'start_date, end_date, duration_type are required.' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create program
        const { rows: [program] } = await client.query(
            `INSERT INTO programs (user_id, start_date, end_date, duration_type, status)
       VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
            [req.user.id, start_date, end_date, duration_type]
        );

        // 2. Bulk-insert schedule entries (generated client-side, sent in request body)
        if (entries && entries.length > 0) {
            const values = [];
            const params = [];
            let idx = 1;

            entries.forEach((e) => {
                values.push(
                    `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
                );
                params.push(
                    program.id,
                    req.user.id,
                    e.day_number,
                    e.time_of_day,
                    e.activity_title,
                    e.activity_description,
                    e.reference || null,
                    JSON.stringify(e.detail_guide || null),
                    e.mantra_lyrics || null
                );
            });

            await client.query(
                `INSERT INTO schedule_entries
          (program_id, user_id, day_number, time_of_day, activity_title, activity_description, reference, detail_guide, mantra_lyrics)
         VALUES ${values.join(', ')}`,
                params
            );
        }

        await client.query('COMMIT');
        return res.status(201).json(program);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create program error:', err.message);
        return res.status(500).json({ error: 'Failed to create program.' });
    } finally {
        client.release();
    }
});

// ── GET /api/v1/programs/active ───────────────────────────
router.get('/active', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM programs WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
            [req.user.id]
        );
        return res.json(rows[0] || null);
    } catch (err) {
        console.error('Get active program error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── GET /api/v1/programs/:id ──────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const [progRes, entriesRes] = await Promise.all([
            pool.query('SELECT * FROM programs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]),
            pool.query(
                'SELECT * FROM schedule_entries WHERE program_id = $1 ORDER BY day_number ASC, time_of_day ASC',
                [req.params.id]
            ),
        ]);
        if (!progRes.rows[0]) return res.status(404).json({ error: 'Program not found.' });
        return res.json({ ...progRes.rows[0], entries: entriesRes.rows });
    } catch (err) {
        console.error('Get program error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── PUT /api/v1/programs/:id/cancel ──────────────────────
router.put('/:id/cancel', async (req, res) => {
    try {
        await pool.query(
            `UPDATE programs SET status = 'cancelled' WHERE user_id = $1 AND status = 'active'`,
            [req.user.id]
        );
        return res.json({ message: 'Program cancelled.' });
    } catch (err) {
        console.error('Cancel program error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
