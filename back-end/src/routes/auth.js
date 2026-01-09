const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin by email
        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    console.log('verifyToken - Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('verifyToken - Token extracted:', token ? `${token.substring(0, 20)}...` : 'None');
    console.log('verifyToken - JWT_SECRET configured:', process.env.JWT_SECRET ? 'Yes' : 'NO - MISSING!');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('verifyToken - Success for user:', decoded.email);
        next();
    } catch (error) {
        console.error('verifyToken - Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid token', details: error.message });
    }
};

module.exports = router;
module.exports.verifyToken = verifyToken;
