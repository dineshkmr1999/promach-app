const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MasterItem = require('../models/MasterItem');
const InventoryTransaction = require('../models/InventoryTransaction');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

router.use(verifyERPToken);

// ────────────────────────────────────────────────────────────
// GET /  — List all assets (filterable by status)
// ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { assetStatus, search, page = 1, limit = 50 } = req.query;
        const filter = { itemType: 'Asset', isActive: true };
        if (assetStatus) filter.assetStatus = assetStatus;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { assetTag: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [assets, total] = await Promise.all([
            MasterItem.find(filter)
                .populate('currentHolder', 'name email phone')
                .populate('currentLocation', 'name locationType')
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            MasterItem.countDocuments(filter)
        ]);

        res.json({ assets, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('List assets error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/checkout  — Check out an asset to a technician
//
// Locks the asset so no other technician can book it.
// Uses ACID transaction to prevent race conditions.
// ────────────────────────────────────────────────────────────
router.post('/:id/checkout', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { locationId, jobTicketId, notes } = req.body;

        let asset;
        await session.withTransaction(async () => {
            // Atomically find the asset only if it's available
            asset = await MasterItem.findOneAndUpdate(
                {
                    _id: req.params.id,
                    itemType: 'Asset',
                    assetStatus: 'available'
                },
                {
                    assetStatus: 'in_use',
                    currentHolder: req.erpUser.id,
                    currentLocation: locationId || null
                },
                { new: true, session }
            );

            if (!asset) {
                throw new Error('Asset not available for checkout (may be in use or in maintenance)');
            }

            await InventoryTransaction.create([{
                txnType: 'Asset_CheckOut',
                item: asset._id,
                location: locationId || asset.currentLocation,
                quantity: mongoose.Types.Decimal128.fromString('1'),
                relatedJobTicket: jobTicketId || null,
                performedBy: req.erpUser.id,
                notes
            }], { session });
        });

        session.endSession();
        const populated = await MasterItem.findById(asset._id)
            .populate('currentHolder', 'name email phone')
            .populate('currentLocation', 'name');
        res.json(populated);
    } catch (error) {
        session.endSession();
        if (error.message.includes('not available')) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Asset checkout error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/checkin  — Return an asset
// ────────────────────────────────────────────────────────────
router.post('/:id/checkin', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { returnLocationId, condition, notes } = req.body;
        // condition: 'good' → available, 'damaged' → maintenance

        let asset;
        await session.withTransaction(async () => {
            asset = await MasterItem.findOneAndUpdate(
                {
                    _id: req.params.id,
                    itemType: 'Asset',
                    assetStatus: 'in_use'
                },
                {
                    assetStatus: condition === 'damaged' ? 'maintenance' : 'available',
                    currentHolder: null,
                    currentLocation: returnLocationId || null
                },
                { new: true, session }
            );

            if (!asset) {
                throw new Error('Asset is not currently checked out');
            }

            await InventoryTransaction.create([{
                txnType: 'Asset_CheckIn',
                item: asset._id,
                location: returnLocationId || asset.currentLocation,
                quantity: mongoose.Types.Decimal128.fromString('1'),
                performedBy: req.erpUser.id,
                notes: notes || (condition === 'damaged' ? 'Returned damaged — sent to maintenance' : 'Returned in good condition')
            }], { session });
        });

        session.endSession();
        const populated = await MasterItem.findById(asset._id)
            .populate('currentHolder', 'name')
            .populate('currentLocation', 'name');
        res.json(populated);
    } catch (error) {
        session.endSession();
        if (error.message.includes('not currently checked out')) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Asset checkin error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// PATCH /:id/maintenance  — Change maintenance status (Admin/Ops)
// ────────────────────────────────────────────────────────────
router.patch('/:id/maintenance', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const { action } = req.body; // 'start' | 'complete' | 'retire'
        const statusMap = {
            start: 'maintenance',
            complete: 'available',
            retire: 'retired'
        };

        if (!statusMap[action]) {
            return res.status(400).json({ message: 'action must be start, complete, or retire' });
        }

        const asset = await MasterItem.findOneAndUpdate(
            { _id: req.params.id, itemType: 'Asset' },
            { assetStatus: statusMap[action], currentHolder: null },
            { new: true }
        ).populate('currentLocation', 'name');

        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        res.json(asset);
    } catch (error) {
        console.error('Maintenance update error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /:id/history  — Full check-out/in history of an asset
// ────────────────────────────────────────────────────────────
router.get('/:id/history', async (req, res) => {
    try {
        const txns = await InventoryTransaction.find({
            item: req.params.id,
            txnType: { $in: ['Asset_CheckOut', 'Asset_CheckIn'] }
        })
            .populate('performedBy', 'name')
            .populate('location', 'name')
            .populate('relatedJobTicket', 'ticketNumber')
            .sort({ createdAt: -1 });
        res.json(txns);
    } catch (error) {
        console.error('Asset history error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
