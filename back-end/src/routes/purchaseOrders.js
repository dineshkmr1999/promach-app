const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryLedger = require('../models/InventoryLedger');
const InventoryTransaction = require('../models/InventoryTransaction');
const MasterItem = require('../models/MasterItem');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

router.use(verifyERPToken);

// Generate next PO number
async function nextPONumber() {
    const last = await PurchaseOrder.findOne().sort({ createdAt: -1 }).select('poNumber');
    if (!last) return 'PO-000001';
    const seq = parseInt(last.poNumber.split('-')[1], 10) + 1;
    return `PO-${String(seq).padStart(6, '0')}`;
}

// ────────────────────────────────────────────────────────────
// GET /  — List purchase orders
// ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { status, page = 1, limit = 25 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        // Staff (Field_Technician) only see their own POs
        if (req.erpUser.role === 'Field_Technician') {
            filter.createdBy = req.erpUser.id;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [orders, total] = await Promise.all([
            PurchaseOrder.find(filter)
                .populate('deliverTo', 'name locationType')
                .populate('createdBy', 'name')
                .populate('approvedBy', 'name')
                .populate('lines.item', 'name sku uom')
                .populate('relatedJobTicket', 'ticketNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PurchaseOrder.countDocuments(filter)
        ]);

        res.json({ orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('List POs error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /:id
// ────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id)
            .populate('deliverTo', 'name locationType')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name')
            .populate('lines.item', 'name sku uom unitCost sellingPrice')
            .populate('relatedJobTicket', 'ticketNumber customer');
        if (!po) return res.status(404).json({ message: 'Purchase order not found' });
        res.json(po);
    } catch (error) {
        console.error('Get PO error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /  — Create a new PO (Staff + Admin/Ops)
// ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { supplier, lines, deliverTo, expectedDeliveryDate, notes, relatedJobTicket } = req.body;

        if (!supplier?.name || !lines?.length || !deliverTo) {
            return res.status(400).json({ message: 'supplier.name, lines[], and deliverTo are required' });
        }

        const poNumber = await nextPONumber();
        const po = new PurchaseOrder({
            poNumber,
            supplier,
            lines: lines.map(l => ({
                item: l.itemId,
                quantity: mongoose.Types.Decimal128.fromString(String(l.quantity)),
                unitCost: mongoose.Types.Decimal128.fromString(String(l.unitCost || 0))
            })),
            deliverTo,
            expectedDeliveryDate,
            notes,
            relatedJobTicket: relatedJobTicket || null,
            createdBy: req.erpUser.id,
            // Field techs create as Draft; Admin/Ops can create as Submitted
            status: ['Admin', 'Operations_Manager'].includes(req.erpUser.role) ? 'Submitted' : 'Draft'
        });

        po.recalcTotal();
        await po.save();

        const populated = await PurchaseOrder.findById(po._id)
            .populate('deliverTo', 'name locationType')
            .populate('createdBy', 'name')
            .populate('lines.item', 'name sku uom');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Create PO error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// PATCH /:id  — Update a Draft PO
// ────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) return res.status(404).json({ message: 'Not found' });

        // Only Draft/Submitted can be edited
        if (!['Draft', 'Submitted'].includes(po.status)) {
            return res.status(400).json({ message: 'Cannot edit a PO that is already approved or received' });
        }

        // Staff can only edit their own POs
        if (req.erpUser.role === 'Field_Technician' && po.createdBy.toString() !== req.erpUser.id) {
            return res.status(403).json({ message: 'You can only edit your own purchase orders' });
        }

        const { supplier, lines, deliverTo, expectedDeliveryDate, notes } = req.body;
        if (supplier) po.supplier = supplier;
        if (deliverTo) po.deliverTo = deliverTo;
        if (expectedDeliveryDate) po.expectedDeliveryDate = expectedDeliveryDate;
        if (notes !== undefined) po.notes = notes;
        if (lines) {
            po.lines = lines.map(l => ({
                item: l.itemId || l.item,
                quantity: mongoose.Types.Decimal128.fromString(String(l.quantity)),
                unitCost: mongoose.Types.Decimal128.fromString(String(l.unitCost || 0)),
                receivedQuantity: mongoose.Types.Decimal128.fromString(String(l.receivedQuantity || 0))
            }));
        }
        po.recalcTotal();
        await po.save();

        const populated = await PurchaseOrder.findById(po._id)
            .populate('deliverTo', 'name locationType')
            .populate('createdBy', 'name')
            .populate('lines.item', 'name sku uom');
        res.json(populated);
    } catch (error) {
        console.error('Update PO error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/submit  — Staff submits a Draft PO for approval
// ────────────────────────────────────────────────────────────
router.post('/:id/submit', async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) return res.status(404).json({ message: 'Not found' });
        if (po.status !== 'Draft') return res.status(400).json({ message: 'Only Draft POs can be submitted' });

        po.status = 'Submitted';
        await po.save();
        res.json({ message: 'PO submitted for approval', poNumber: po.poNumber });
    } catch (error) {
        console.error('Submit PO error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/approve  — Admin/Ops approves a PO
// ────────────────────────────────────────────────────────────
router.post('/:id/approve', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) return res.status(404).json({ message: 'Not found' });
        if (po.status !== 'Submitted') return res.status(400).json({ message: 'Only Submitted POs can be approved' });

        po.status = 'Approved';
        po.approvedBy = req.erpUser.id;
        po.approvedAt = new Date();
        await po.save();

        res.json({ message: 'PO approved', poNumber: po.poNumber });
    } catch (error) {
        console.error('Approve PO error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/receive  — Receive goods against PO items (ACID)
// Updates inventory and marks PO as Partially_Received/Received
// ────────────────────────────────────────────────────────────
router.post('/:id/receive', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { receivedLines } = req.body;
        // receivedLines: [{ lineId, quantity }]
        if (!receivedLines?.length) {
            return res.status(400).json({ message: 'receivedLines[] is required' });
        }

        await session.withTransaction(async () => {
            const po = await PurchaseOrder.findById(req.params.id).session(session);
            if (!po) throw new Error('PO not found');
            if (!['Approved', 'Partially_Received'].includes(po.status)) {
                throw new Error('PO must be Approved or Partially_Received to receive goods');
            }

            for (const rl of receivedLines) {
                const line = po.lines.id(rl.lineId);
                if (!line) throw new Error(`Line ${rl.lineId} not found`);

                const receivedQty = parseFloat(String(rl.quantity));
                if (receivedQty <= 0) continue;

                const currentReceived = parseFloat(line.receivedQuantity.toString());
                const ordered = parseFloat(line.quantity.toString());

                if (currentReceived + receivedQty > ordered) {
                    throw new Error(`Cannot receive more than ordered for line ${rl.lineId}`);
                }

                line.receivedQuantity = mongoose.Types.Decimal128.fromString(String(currentReceived + receivedQty));

                // Add to inventory at deliver-to location
                await InventoryLedger.findOneAndUpdate(
                    { item: line.item, location: po.deliverTo },
                    { $inc: { quantityOnHand: receivedQty } },
                    { upsert: true, session }
                );

                // Create transaction record
                await InventoryTransaction.create([{
                    txnType: 'Receive',
                    item: line.item,
                    location: po.deliverTo,
                    quantity: mongoose.Types.Decimal128.fromString(String(receivedQty)),
                    performedBy: req.erpUser.id,
                    notes: `PO ${po.poNumber} received`
                }], { session });

                // Update item's lastPurchasePrice
                await MasterItem.updateOne(
                    { _id: line.item },
                    { $set: { 'supplier.lastPurchasePrice': line.unitCost } },
                    { session }
                );
            }

            // Check if fully received
            const allReceived = po.lines.every(l => {
                return parseFloat(l.receivedQuantity.toString()) >= parseFloat(l.quantity.toString());
            });
            po.status = allReceived ? 'Received' : 'Partially_Received';

            await po.save({ session });
        });

        session.endSession();

        const updated = await PurchaseOrder.findById(req.params.id)
            .populate('deliverTo', 'name locationType')
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name')
            .populate('lines.item', 'name sku uom');
        res.json(updated);
    } catch (error) {
        session.endSession();
        if (['PO not found', 'PO must be', 'Cannot receive', 'Line'].some(m => error.message.includes(m))) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Receive PO error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/cancel  — Cancel a PO
// ────────────────────────────────────────────────────────────
router.post('/:id/cancel', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) return res.status(404).json({ message: 'Not found' });
        if (['Received', 'Cancelled'].includes(po.status)) {
            return res.status(400).json({ message: 'Cannot cancel a received or already cancelled PO' });
        }

        po.status = 'Cancelled';
        await po.save();
        res.json({ message: 'PO cancelled', poNumber: po.poNumber });
    } catch (error) {
        console.error('Cancel PO error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
