const jwt = require('jsonwebtoken');
const ERPUser = require('../models/ERPUser');

/**
 * Verify JWT token from ERP users OR CMS admin users.
 * ERP tokens carry an `erpUser` flag; CMS admin tokens carry a role of admin/superadmin.
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

        if (decoded.erpUser) {
            // Native ERP token
            req.erpUser = decoded;
        } else if (decoded.role === 'admin' || decoded.role === 'superadmin') {
            // CMS admin token — grant full ERP Admin access
            req.erpUser = { id: decoded.id, email: decoded.email, role: 'Admin', erpUser: true, cmsAdmin: true };
        } else {
            return res.status(401).json({ message: 'Invalid token' });
        }

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
