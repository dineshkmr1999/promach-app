const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const InventoryLedger = require('../models/InventoryLedger');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

router.use(verifyERPToken);

// ─── GET /  (list locations, optionally filtered by type) ───
router.get('/', async (req, res) => {
    try {
        const { locationType, isActive } = req.query;
        const filter = {};
        if (locationType) filter.locationType = locationType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const locations = await Location.find(filter)
            .populate('parent', 'name locationType')
            .populate('assignedTechnicians', 'name email role')
            .sort({ locationType: 1, name: 1 });
        res.json(locations);
    } catch (error) {
        console.error('List locations error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET /:id ───
router.get('/:id', async (req, res) => {
    try {
        const location = await Location.findById(req.params.id)
            .populate('parent', 'name locationType')
            .populate('assignedTechnicians', 'name email phone')
            .populate('linkedJobTicket', 'ticketNumber jobType status');
        if (!location) return res.status(404).json({ message: 'Location not found' });
        res.json(location);
    } catch (error) {
        console.error('Get location error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET /:id/stock  (view stock levels at a location) ───
router.get('/:id/stock', async (req, res) => {
    try {
        const ledger = await InventoryLedger.find({ location: req.params.id })
            .populate('item', 'name sku itemType uom unitCost sellingPrice reorderLevel')
            .sort({ 'item.name': 1 });
        res.json(ledger);
    } catch (error) {
        console.error('Get location stock error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── POST /  (Admin & Ops Manager) ───
router.post('/', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const location = await Location.create(req.body);
        res.status(201).json(location);
    } catch (error) {
        console.error('Create location error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── PUT /:id  (Admin & Ops Manager) ───
router.put('/:id', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('assignedTechnicians', 'name email');
        if (!location) return res.status(404).json({ message: 'Location not found' });
        res.json(location);
    } catch (error) {
        console.error('Update location error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── DELETE /:id  (Admin only — soft delete) ───
router.delete('/:id', requireRole('Admin'), async (req, res) => {
    try {
        const location = await Location.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!location) return res.status(404).json({ message: 'Location not found' });
        res.json({ message: 'Location deactivated', location });
    } catch (error) {
        console.error('Delete location error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
