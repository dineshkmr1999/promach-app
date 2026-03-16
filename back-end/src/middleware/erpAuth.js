const jwt = require('jsonwebtoken');
const ERPUser = require('../models/ERPUser');

/**
 * Verify JWT token from ERP users.
 * Attaches decoded payload to req.erpUser = { id, email, role }
 */
const verifyERPToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // ERP tokens carry an `erpUser` flag to distinguish from CMS admin tokens
        if (!decoded.erpUser) {
            return res.status(401).json({ message: 'Invalid ERP token' });
        }
        req.erpUser = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * Restrict access to specific ERP roles.
 * Usage: requireRole('Admin', 'Operations_Manager')
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.erpUser) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.erpUser.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};

module.exports = { verifyERPToken, requireRole };
