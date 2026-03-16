const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

// All routes require ERP auth
router.use(verifyERPToken);

// ─── GET /  (list categories, with optional filters) ───
router.get('/', async (req, res) => {
    try {
        const { search, isActive, parentId } = req.query;
        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (parentId === 'null') filter.parentCategory = null;
        else if (parentId) filter.parentCategory = parentId;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
            ];
        }

        const categories = await Category.find(filter)
            .populate('parentCategory', 'name code')
            .sort({ sortOrder: 1, name: 1 });

        res.json(categories);
    } catch (error) {
        console.error('List categories error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET /:id ───
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parentCategory', 'name code');
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        console.error('Get category error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── POST /  (Admin & Ops Manager) ───
router.post('/', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const { name, code, description, parentCategory, sortOrder } = req.body;

        if (!name || !code) {
            return res.status(400).json({ message: 'Name and code are required' });
        }

        const category = await Category.create({
            name: name.trim(),
            code: code.trim().toUpperCase(),
            description: description?.trim(),
            parentCategory: parentCategory || null,
            sortOrder: sortOrder || 0,
        });

        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Category code already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        console.error('Create category error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── PUT /:id  (Admin & Ops Manager) ───
router.put('/:id', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const { name, code, description, parentCategory, sortOrder, isActive } = req.body;

        // Prevent a category from being its own parent
        if (parentCategory === req.params.id) {
            return res.status(400).json({ message: 'A category cannot be its own parent' });
        }

        const update = {};
        if (name !== undefined) update.name = name.trim();
        if (code !== undefined) update.code = code.trim().toUpperCase();
        if (description !== undefined) update.description = description.trim();
        if (parentCategory !== undefined) update.parentCategory = parentCategory || null;
        if (sortOrder !== undefined) update.sortOrder = sortOrder;
        if (isActive !== undefined) update.isActive = isActive;

        const category = await Category.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        }).populate('parentCategory', 'name code');

        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Category code already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        console.error('Update category error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── DELETE /:id  (Admin only — soft delete) ───
router.delete('/:id', requireRole('Admin'), async (req, res) => {
    try {
        // Check if any child categories exist
        const childCount = await Category.countDocuments({ parentCategory: req.params.id, isActive: true });
        if (childCount > 0) {
            return res.status(400).json({ message: 'Cannot deactivate a category with active sub-categories' });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deactivated', category });
    } catch (error) {
        console.error('Delete category error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
