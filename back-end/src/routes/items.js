const express = require('express');
const router = express.Router();
const MasterItem = require('../models/MasterItem');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

// All routes require ERP auth
router.use(verifyERPToken);

// ─── GET /  (list all items, with optional filters) ───
router.get('/', async (req, res) => {
    try {
        const { itemType, search, isActive, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (itemType) filter.itemType = itemType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [items, total] = await Promise.all([
            MasterItem.find(filter)
                .populate('currentHolder', 'name')
                .populate('currentLocation', 'name locationType')
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            MasterItem.countDocuments(filter)
        ]);

        res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('List items error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET /:id ───
router.get('/:id', async (req, res) => {
    try {
        const item = await MasterItem.findById(req.params.id)
            .populate('currentHolder', 'name email')
            .populate('currentLocation', 'name locationType')
            .populate('kitComponents.item', 'name sku uom unitCost');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        console.error('Get item error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── POST /  (Admin & Ops Manager) ───
router.post('/', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const item = await MasterItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'SKU already exists' });
        }
        console.error('Create item error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── PUT /:id  (Admin & Ops Manager) ───
router.put('/:id', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        // Prevent changing itemType after creation (would break inventory logic)
        delete req.body.itemType;

        const item = await MasterItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'SKU already exists' });
        }
        console.error('Update item error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── DELETE /:id  (Admin only — soft delete) ───
router.delete('/:id', requireRole('Admin'), async (req, res) => {
    try {
        const item = await MasterItem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deactivated', item });
    } catch (error) {
        console.error('Delete item error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
