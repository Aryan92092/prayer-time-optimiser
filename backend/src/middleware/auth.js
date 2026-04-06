const jwt = require('jsonwebtoken');

/**
 * Middleware: verifies JWT from Authorization header.
 * Sets req.user = { id, email } on success.
 */
module.exports = function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'No token provided — please log in.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token — please log in again.' });
    }
};
