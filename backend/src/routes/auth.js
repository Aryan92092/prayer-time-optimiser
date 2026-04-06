const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

/** Helper: sign a JWT for a user */
function signToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// ── POST /api/v1/auth/register ────────────────────────────
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'name, email and password are required.' });

    try {
        // Check for existing user
        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0)
            return res.status(409).json({ error: 'An account with this email already exists.' });

        const password_hash = await bcrypt.hash(password, 12);

        // Insert user
        const { rows } = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, password_hash]
        );
        const user = rows[0];

        // Create profile
        await pool.query(
            'INSERT INTO profiles (id, name, email) VALUES ($1, $2, $3)',
            [user.id, name, email]
        );

        const token = signToken(user);
        return res.status(201).json({ token, user: { id: user.id, email: user.email, name } });
    } catch (err) {
        console.error('Register error:', err.message);
        return res.status(500).json({ error: 'Server error during registration.' });
    }
});

// ── POST /api/v1/auth/login ───────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'email and password are required.' });

    try {
        const { rows } = await pool.query(
            'SELECT u.id, u.email, u.password_hash, p.name, p.role FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.email = $1',
            [email]
        );
        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

        const token = signToken(user);
        return res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ error: 'Server error during login.' });
    }
});

// ── POST /api/v1/auth/forgot-password ────────────────────
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required.' });

    try {
        const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        // Always return success to prevent email enumeration
        if (rows.length === 0) return res.json({ message: 'If that email exists, a reset link has been sent.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

        await pool.query(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [rows[0].id, token, expires]
        );

        // TODO: Send email with token. For now, return token in dev mode.
        console.log(`🔑 Password reset token for ${email}: ${token}`);

        return res.json({ message: 'If that email exists, a reset link has been sent.', dev_token: token });
    } catch (err) {
        console.error('Forgot password error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── POST /api/v1/auth/reset-password ─────────────────────
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'token and password are required.' });

    try {
        const { rows } = await pool.query(
            'SELECT * FROM password_resets WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
            [token]
        );
        if (rows.length === 0)
            return res.status(400).json({ error: 'Invalid or expired reset token.' });

        const reset = rows[0];
        const password_hash = await bcrypt.hash(password, 12);

        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, reset.user_id]);
        await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [reset.id]);

        return res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Reset password error:', err.message);
        return res.status(500).json({ error: 'Server error.' });
    }
});

// ── GET /api/v1/auth/me (validate token & get user) ──────
router.get('/me', requireAuth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT u.id, u.email, p.name, p.role FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1',
            [req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
        return res.json(rows[0]);
    } catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
