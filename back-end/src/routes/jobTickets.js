const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const JobTicket = require('../models/JobTicket');
const InventoryLedger = require('../models/InventoryLedger');
const InventoryTransaction = require('../models/InventoryTransaction');
const MasterItem = require('../models/MasterItem');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

router.use(verifyERPToken);

// ────────────────────────────────────────────────────────────
// Helper: Generate sequential ticket number
// ────────────────────────────────────────────────────────────
async function nextTicketNumber() {
    const last = await JobTicket.findOne().sort({ createdAt: -1 }).select('ticketNumber');
    if (!last) return 'JOB-000001';
    const seq = parseInt(last.ticketNumber.split('-')[1], 10) + 1;
    return `JOB-${String(seq).padStart(6, '0')}`;
}

// ────────────────────────────────────────────────────────────
// GET /  — List job tickets
// ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { status, jobType, technicianId, page = 1, limit = 25, from, to } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (jobType) filter.jobType = jobType;
        if (technicianId) filter.assignedTechnicians = technicianId;
        if (from || to) {
            filter.scheduledDate = {};
            if (from) filter.scheduledDate.$gte = new Date(from);
            if (to) filter.scheduledDate.$lte = new Date(to);
        }

        // Technicians only see their own tickets
        if (req.erpUser.role === 'Field_Technician') {
            filter.assignedTechnicians = req.erpUser.id;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [tickets, total] = await Promise.all([
            JobTicket.find(filter)
                .populate('assignedTechnicians', 'name phone')
                .populate('createdBy', 'name')
                .sort({ scheduledDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            JobTicket.countDocuments(filter)
        ]);

        res.json({ tickets, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        console.error('List tickets error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /:id  — Single ticket with full cost lines
// ────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const ticket = await JobTicket.findById(req.params.id)
            .populate('assignedTechnicians', 'name phone email')
            .populate('createdBy', 'name')
            .populate('costLines.item', 'name sku uom')
            .populate('costLines.consumedFrom', 'name locationType')
            .populate('costLines.loggedBy', 'name')
            .populate('linkedSubmission');
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (error) {
        console.error('Get ticket error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /  — Create a job ticket (Admin / Ops Manager)
// ────────────────────────────────────────────────────────────
router.post('/', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        const ticketNumber = await nextTicketNumber();
        const ticket = await JobTicket.create({
            ...req.body,
            ticketNumber,
            createdBy: req.erpUser.id
        });
        res.status(201).json(ticket);
    } catch (error) {
        console.error('Create ticket error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// PATCH /:id  — Update ticket (status, assignment, etc.)
// ────────────────────────────────────────────────────────────
router.patch('/:id', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    try {
        // Protect immutable fields
        delete req.body.ticketNumber;
        delete req.body.costLines;
        delete req.body.totalMaterialCost;
        delete req.body.grossProfit;

        const ticket = await JobTicket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('assignedTechnicians', 'name phone');
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        res.json(ticket);
    } catch (error) {
        console.error('Update ticket error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/consume  — Fractional Consumption Workflow
//
// A technician logs material usage on a job ticket.
// ACID transaction:
//   1. Verify van/location has sufficient stock
//   2. Deduct quantity from InventoryLedger
//   3. Write InventoryTransaction audit record
//   4. Append cost line to the job ticket
//   5. Recalculate gross profit
// ────────────────────────────────────────────────────────────
router.post('/:id/consume', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { itemId, locationId, quantity, notes } = req.body;
        if (!itemId || !locationId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'itemId, locationId, and a positive quantity are required' });
        }

        let result;
        await session.withTransaction(async () => {
            // 1. Load the item to get unit cost
            const item = await MasterItem.findById(itemId).session(session);
            if (!item) throw new Error('Item not found');
            if (item.itemType !== 'Consumable') throw new Error('Only consumable items can be consumed on a job');

            const unitCost = parseFloat(item.unitCost.toString());
            const qty = parseFloat(quantity);
            const totalCost = parseFloat((unitCost * qty).toFixed(2));

            // 2. Check & deduct stock from the source location
            const ledger = await InventoryLedger.findOne({
                item: itemId,
                location: locationId
            }).session(session);

            if (!ledger) throw new Error('No stock found at this location for this item');

            const onHand = parseFloat(ledger.quantityOnHand.toString());
            if (onHand < qty) {
                throw new Error(`Insufficient stock: ${onHand} available, ${qty} requested`);
            }

            await InventoryLedger.updateOne(
                { _id: ledger._id },
                { $inc: { quantityOnHand: -qty } },
                { session }
            );

            // 3. Audit trail
            await InventoryTransaction.create([{
                txnType: 'Consume',
                item: itemId,
                location: locationId,
                quantity: mongoose.Types.Decimal128.fromString(String(-qty)),
                relatedJobTicket: req.params.id,
                performedBy: req.erpUser.id,
                notes
            }], { session });

            // 4. Append cost line to job ticket and recalculate
            const ticket = await JobTicket.findById(req.params.id).session(session);
            if (!ticket) throw new Error('Job ticket not found');

            ticket.costLines.push({
                item: itemId,
                description: item.name,
                quantity: mongoose.Types.Decimal128.fromString(String(qty)),
                unitCost: item.unitCost,
                totalCost: mongoose.Types.Decimal128.fromString(totalCost.toFixed(2)),
                consumedFrom: locationId,
                loggedBy: req.erpUser.id,
                loggedAt: new Date()
            });

            ticket.recalcCosts();
            await ticket.save({ session });

            result = ticket;
        });

        session.endSession();

        // Return fresh populated ticket
        const populated = await JobTicket.findById(result._id)
            .populate('costLines.item', 'name sku uom')
            .populate('costLines.consumedFrom', 'name')
            .populate('costLines.loggedBy', 'name');
        res.json(populated);
    } catch (error) {
        session.endSession();
        if (
            error.message.includes('Insufficient stock') ||
            error.message.includes('not found') ||
            error.message.includes('Only consumable')
        ) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Consume material error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// DELETE /:id/costline/:lineId  — Remove a cost line (undo)
// Reverses the inventory deduction within an ACID txn
// ────────────────────────────────────────────────────────────
router.delete('/:id/costline/:lineId', requireRole('Admin', 'Operations_Manager'), async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const ticket = await JobTicket.findById(req.params.id).session(session);
            if (!ticket) throw new Error('Ticket not found');

            const lineIndex = ticket.costLines.findIndex(cl => cl._id.toString() === req.params.lineId);
            if (lineIndex === -1) throw new Error('Cost line not found');

            const line = ticket.costLines[lineIndex];
            const qty = parseFloat(line.quantity.toString());

            // Restore stock to original location
            await InventoryLedger.findOneAndUpdate(
                { item: line.item, location: line.consumedFrom },
                { $inc: { quantityOnHand: qty } },
                { upsert: true, session }
            );

            // Audit trail
            await InventoryTransaction.create([{
                txnType: 'Adjust',
                item: line.item,
                location: line.consumedFrom,
                quantity: mongoose.Types.Decimal128.fromString(String(qty)),
                relatedJobTicket: req.params.id,
                performedBy: req.erpUser.id,
                notes: `Reversed cost line ${req.params.lineId}`
            }], { session });

            ticket.costLines.splice(lineIndex, 1);
            ticket.recalcCosts();
            await ticket.save({ session });
        });

        session.endSession();
        const updated = await JobTicket.findById(req.params.id)
            .populate('costLines.item', 'name sku uom');
        res.json(updated);
    } catch (error) {
        session.endSession();
        if (error.message.includes('not found')) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Remove cost line error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /:id/profitability  — Gross profit breakdown
// ────────────────────────────────────────────────────────────
router.get('/:id/profitability', async (req, res) => {
    try {
        const ticket = await JobTicket.findById(req.params.id)
            .populate('costLines.item', 'name sku uom');
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        const quoted = parseFloat(ticket.quotedPrice.toString());
        const materialCost = parseFloat(ticket.totalMaterialCost.toString());
        const gross = parseFloat(ticket.grossProfit.toString());
        const margin = quoted > 0 ? ((gross / quoted) * 100).toFixed(1) : 0;

        res.json({
            ticketNumber: ticket.ticketNumber,
            quotedPrice: quoted,
            totalMaterialCost: materialCost,
            grossProfit: gross,
            grossMarginPercent: parseFloat(margin),
            costLines: ticket.costLines
        });
    } catch (error) {
        console.error('Profitability error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
