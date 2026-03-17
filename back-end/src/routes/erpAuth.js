const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ERPUser = require('../models/ERPUser');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

// ─── POST /login ───
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await ERPUser.findOne({ email: email.toLowerCase(), isActive: true });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const valid = await user.comparePassword(password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, erpUser: true },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );

        res.json({ token, user: user.toJSON() });
    } catch (error) {
        console.error('ERP login error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET /me ───
router.get('/me', verifyERPToken, async (req, res) => {
    try {
        const user = await ERPUser.findById(req.erpUser.id)
            .populate('assignedVan', 'name locationType vehicleNumber');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET /users  (Admin & Ops Manager) ───
router.get('/users', verifyERPToken, requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const { role, isActive } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const users = await ERPUser.find(filter)
            .populate('assignedVan', 'name locationType vehicleNumber')
            .sort({ name: 1 });
        res.json(users);
    } catch (error) {
        console.error('List users error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── POST /users  (Admin only) ───
router.post('/users', verifyERPToken, requireRole('Admin'), async (req, res) => {
    try {
        const { name, email, password, phone, role, assignedVan } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'name, email, password, and role are required' });
        }

        const existing = await ERPUser.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const user = await ERPUser.create({ name, email, password, phone, role, assignedVan });
        res.status(201).json(user);
    } catch (error) {
        console.error('Create user error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── PATCH /users/:id  (Admin only) ───
router.patch('/users/:id', verifyERPToken, requireRole('Admin'), async (req, res) => {
    try {
        const { name, phone, role, assignedVan, isActive } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (role !== undefined) updates.role = role;
        if (assignedVan !== undefined) updates.assignedVan = assignedVan;
        if (isActive !== undefined) updates.isActive = isActive;

        const user = await ERPUser.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
            .populate('assignedVan', 'name locationType vehicleNumber');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Update user error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── POST /register  (Public — creates User role only) ───
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        const existing = await ERPUser.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        const user = await ERPUser.create({ name, email, password, phone, role: 'User' });
        const token = jwt.sign(
            { id: user._id, email: user.email, role: 'User', erpUser: true },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );
        res.status(201).json({ token, user: user.toJSON() });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
