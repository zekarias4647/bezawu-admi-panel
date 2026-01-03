const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // Contains id, email, role, branchId, supermarketId
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(403).json({ message: 'Invalid or expired token. Please re-login.' });
    }
};

module.exports = authMiddleware;
