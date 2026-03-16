const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const InventoryLedger = require('../models/InventoryLedger');
const InventoryTransaction = require('../models/InventoryTransaction');
const MasterItem = require('../models/MasterItem');
const StockTransfer = require('../models/StockTransfer');
const Location = require('../models/Location');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

router.use(verifyERPToken);

// ────────────────────────────────────────────────────────────
// Helper: Generate sequential transfer / txn numbers
// ────────────────────────────────────────────────────────────
async function nextTransferNumber() {
    const last = await StockTransfer.findOne().sort({ createdAt: -1 }).select('transferNumber');
    if (!last) return 'TRF-000001';
    const seq = parseInt(last.transferNumber.split('-')[1], 10) + 1;
    return `TRF-${String(seq).padStart(6, '0')}`;
}

// ────────────────────────────────────────────────────────────
// POST /receive  — Goods Received into a warehouse
// (Admin / Ops Manager only)
// ────────────────────────────────────────────────────────────
router.post('/receive', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { locationId, items, notes } = req.body;
        // items: [{ itemId, quantity }]
        if (!locationId || !items || !items.length) {
            return res.status(400).json({ message: 'locationId and items[] are required' });
        }

        const txns = [];
        await session.withTransaction(async () => {
            for (const entry of items) {
                const qty = mongoose.Types.Decimal128.fromString(String(entry.quantity));

                // Upsert the ledger row: create if not exists, increment if exists
                await InventoryLedger.findOneAndUpdate(
                    { item: entry.itemId, location: locationId },
                    { $inc: { quantityOnHand: parseFloat(entry.quantity) } },
                    { upsert: true, session }
                );

                txns.push({
                    txnType: 'Receive',
                    item: entry.itemId,
                    location: locationId,
                    quantity: qty,
                    performedBy: req.erpUser.id,
                    notes
                });
            }
            await InventoryTransaction.insertMany(txns, { session });
        });

        session.endSession();
        res.status(201).json({ message: 'Stock received', count: items.length });
    } catch (error) {
        session.endSession();
        console.error('Receive stock error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /transfer  — Create a stock transfer (Van Restock)
// Ops Manager creates a transfer Pending → technician Accepts
// ────────────────────────────────────────────────────────────
router.post('/transfer', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const { fromLocationId, toLocationId, items, notes } = req.body;
        if (!fromLocationId || !toLocationId || !items || !items.length) {
            return res.status(400).json({ message: 'fromLocationId, toLocationId, and items[] are required' });
        }

        const transferNumber = await nextTransferNumber();
        const transfer = await StockTransfer.create({
            transferNumber,
            fromLocation: fromLocationId,
            toLocation: toLocationId,
            items: items.map(i => ({
                item: i.itemId,
                quantity: mongoose.Types.Decimal128.fromString(String(i.quantity))
            })),
            status: 'Pending',
            createdBy: req.erpUser.id,
            notes
        });

        res.status(201).json(transfer);
    } catch (error) {
        console.error('Create transfer error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// PATCH /transfer/:id/dispatch  — Mark as In_Transit
// Deducts stock from source location (ACID transaction)
// ────────────────────────────────────────────────────────────
router.patch('/transfer/:id/dispatch', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const transfer = await StockTransfer.findById(req.params.id).session(session);
            if (!transfer) throw new Error('Transfer not found');
            if (transfer.status !== 'Pending') throw new Error('Transfer is not in Pending status');

            // Deduct from source
            for (const line of transfer.items) {
                const qty = parseFloat(line.quantity.toString());
                const ledger = await InventoryLedger.findOne({
                    item: line.item,
                    location: transfer.fromLocation
                }).session(session);

                if (!ledger || parseFloat(ledger.quantityOnHand.toString()) < qty) {
                    throw new Error(`Insufficient stock for item ${line.item} at source location`);
                }

                await InventoryLedger.updateOne(
                    { _id: ledger._id },
                    { $inc: { quantityOnHand: -qty } },
                    { session }
                );

                await InventoryTransaction.create([{
                    txnType: 'Transfer_Out',
                    item: line.item,
                    location: transfer.fromLocation,
                    quantity: mongoose.Types.Decimal128.fromString(String(-qty)),
                    relatedTransfer: transfer._id,
                    performedBy: req.erpUser.id
                }], { session });
            }

            transfer.status = 'In_Transit';
            await transfer.save({ session });
        });

        session.endSession();
        const updated = await StockTransfer.findById(req.params.id)
            .populate('fromLocation', 'name')
            .populate('toLocation', 'name');
        res.json(updated);
    } catch (error) {
        session.endSession();
        if (error.message.includes('Insufficient stock') || error.message.includes('not found') || error.message.includes('not in Pending')) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Dispatch transfer error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// PATCH /transfer/:id/receive  — Technician accepts transfer
// Adds stock to destination location (ACID transaction)
// ────────────────────────────────────────────────────────────
router.patch('/transfer/:id/receive', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const transfer = await StockTransfer.findById(req.params.id).session(session);
            if (!transfer) throw new Error('Transfer not found');
            if (transfer.status !== 'In_Transit') throw new Error('Transfer is not In_Transit');

            // Credit to destination
            for (const line of transfer.items) {
                const qty = parseFloat(line.quantity.toString());

                await InventoryLedger.findOneAndUpdate(
                    { item: line.item, location: transfer.toLocation },
                    { $inc: { quantityOnHand: qty } },
                    { upsert: true, session }
                );

                await InventoryTransaction.create([{
                    txnType: 'Transfer_In',
                    item: line.item,
                    location: transfer.toLocation,
                    quantity: mongoose.Types.Decimal128.fromString(String(qty)),
                    relatedTransfer: transfer._id,
                    performedBy: req.erpUser.id
                }], { session });
            }

            transfer.status = 'Received';
            transfer.receivedBy = req.erpUser.id;
            transfer.receivedAt = new Date();
            await transfer.save({ session });
        });

        session.endSession();
        const updated = await StockTransfer.findById(req.params.id)
            .populate('fromLocation', 'name')
            .populate('toLocation', 'name')
            .populate('receivedBy', 'name');
        res.json(updated);
    } catch (error) {
        session.endSession();
        if (error.message.includes('not found') || error.message.includes('not In_Transit')) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Receive transfer error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /transfers  — List transfers with optional filters
// ────────────────────────────────────────────────────────────
router.get('/transfers', async (req, res) => {
    try {
        const { status, fromLocation, toLocation, page = 1, limit = 25 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (fromLocation) filter.fromLocation = fromLocation;
        if (toLocation) filter.toLocation = toLocation;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [transfers, total] = await Promise.all([
            StockTransfer.find(filter)
                .populate('fromLocation', 'name locationType')
                .populate('toLocation', 'name locationType')
                .populate('createdBy', 'name')
                .populate('receivedBy', 'name')
                .populate('items.item', 'name sku uom')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            StockTransfer.countDocuments(filter)
        ]);

        res.json({ transfers, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('List transfers error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /adjust  — Manual stock adjustment (Admin / Ops)
// ────────────────────────────────────────────────────────────
router.post('/adjust', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { locationId, itemId, newQuantity, notes } = req.body;
        if (!locationId || !itemId || newQuantity === undefined) {
            return res.status(400).json({ message: 'locationId, itemId, and newQuantity are required' });
        }

        await session.withTransaction(async () => {
            const ledger = await InventoryLedger.findOneAndUpdate(
                { item: itemId, location: locationId },
                { quantityOnHand: mongoose.Types.Decimal128.fromString(String(newQuantity)) },
                { upsert: true, new: true, session }
            );

            // Compute delta for the audit log
            const oldQty = ledger.quantityOnHand ? parseFloat(ledger.quantityOnHand.toString()) : 0;
            const delta = newQuantity - oldQty;

            await InventoryTransaction.create([{
                txnType: 'Adjust',
                item: itemId,
                location: locationId,
                quantity: mongoose.Types.Decimal128.fromString(String(delta)),
                performedBy: req.erpUser.id,
                notes: notes || `Manual adjustment to ${newQuantity}`
            }], { session });
        });

        session.endSession();
        res.json({ message: 'Stock adjusted' });
    } catch (error) {
        session.endSession();
        console.error('Adjust stock error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /transactions  — Audit trail of all inventory movements
// ────────────────────────────────────────────────────────────
router.get('/transactions', async (req, res) => {
    try {
        const { txnType, itemId, locationId, jobTicketId, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (txnType) filter.txnType = txnType;
        if (itemId) filter.item = itemId;
        if (locationId) filter.location = locationId;
        if (jobTicketId) filter.relatedJobTicket = jobTicketId;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [txns, total] = await Promise.all([
            InventoryTransaction.find(filter)
                .populate('item', 'name sku uom')
                .populate('location', 'name locationType')
                .populate('performedBy', 'name')
                .populate('relatedJobTicket', 'ticketNumber')
                .populate('relatedTransfer', 'transferNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            InventoryTransaction.countDocuments(filter)
        ]);

        res.json({ transactions: txns, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('List transactions error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /low-stock  — Items below reorder level across all locs
// ────────────────────────────────────────────────────────────
router.get('/low-stock', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: 'masteritems',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'itemInfo'
                }
            },
            { $unwind: '$itemInfo' },
            {
                $match: {
                    'itemInfo.itemType': 'Consumable',
                    'itemInfo.isActive': true
                }
            },
            {
                $addFields: {
                    qtyNum: { $toDouble: '$quantityOnHand' },
                    reorderNum: { $toDouble: '$itemInfo.reorderLevel' }
                }
            },
            {
                $match: {
                    $expr: { $lte: ['$qtyNum', '$reorderNum'] }
                }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: '_id',
                    as: 'locationInfo'
                }
            },
            { $unwind: '$locationInfo' },
            {
                $project: {
                    item: '$itemInfo.name',
                    sku: '$itemInfo.sku',
                    uom: '$itemInfo.uom',
                    location: '$locationInfo.name',
                    locationType: '$locationInfo.locationType',
                    quantityOnHand: { $toDouble: '$quantityOnHand' },
                    reorderLevel: { $toDouble: '$itemInfo.reorderLevel' }
                }
            }
        ];

        const lowStock = await InventoryLedger.aggregate(pipeline);
        res.json(lowStock);
    } catch (error) {
        console.error('Low stock report error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
