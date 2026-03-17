const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const JobTicket = require('../models/JobTicket');
const InventoryLedger = require('../models/InventoryLedger');
const InventoryTransaction = require('../models/InventoryTransaction');
const MasterItem = require('../models/MasterItem');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

router.use(verifyERPToken);

// ── Multer config for job images ──
const jobStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/jobs');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    }
});
const jobUpload = multer({
    storage: jobStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|heic/;
        if (allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase().slice(1))) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

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
        // Users only see tickets they created (their bookings)
        if (req.erpUser.role === 'User') {
            filter.createdBy = req.erpUser.id;
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

// ── Helper: Haversine distance in meters ──
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ────────────────────────────────────────────────────────────
// GET /history/my  — Technician's completed job history
// Must be before /:id to avoid route conflict
// ────────────────────────────────────────────────────────────
router.get('/history/my', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {
            assignedTechnicians: req.erpUser.id,
            status: { $in: ['Completed', 'Invoiced'] }
        };

        const [tickets, total] = await Promise.all([
            JobTicket.find(filter)
                .select('ticketNumber jobType customer status priority scheduledDate completedAt quotedPrice totalMaterialCost grossProfit tracking.durationMinutes tracking.customerRating')
                .sort({ completedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            JobTicket.countDocuments(filter)
        ]);

        // Compute insights
        const allCompleted = await JobTicket.find(filter)
            .select('quotedPrice totalMaterialCost grossProfit tracking.durationMinutes tracking.customerRating');

        let totalRevenue = 0, totalCost = 0, totalProfit = 0, totalDuration = 0, durationCount = 0, totalRating = 0, ratingCount = 0;
        allCompleted.forEach(t => {
            totalRevenue += parseFloat(t.quotedPrice?.toString() || '0');
            totalCost += parseFloat(t.totalMaterialCost?.toString() || '0');
            totalProfit += parseFloat(t.grossProfit?.toString() || '0');
            if (t.tracking?.durationMinutes) { totalDuration += t.tracking.durationMinutes; durationCount++; }
            if (t.tracking?.customerRating) { totalRating += t.tracking.customerRating; ratingCount++; }
        });

        res.json({
            tickets,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            insights: {
                totalJobs: total,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalCost: parseFloat(totalCost.toFixed(2)),
                totalProfit: parseFloat(totalProfit.toFixed(2)),
                avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
                avgRating: ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(1)) : 0,
                ratingCount
            }
        });
    } catch (error) {
        console.error('Job history error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /my-bookings  — Customer (User role) sees own bookings
// ────────────────────────────────────────────────────────────
router.get('/my-bookings', requireRole('User'), async (req, res) => {
    try {
        const tickets = await JobTicket.find({ createdBy: req.erpUser.id })
            .populate('assignedTechnicians', 'name phone')
            .sort({ scheduledDate: -1 });
        res.json(tickets);
    } catch (error) {
        console.error('My bookings error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /book  — Customer (User role) creates a booking
// ────────────────────────────────────────────────────────────
router.post('/book', requireRole('User'), async (req, res) => {
    try {
        const { jobType, scheduledDate, scheduledTimeSlot, customerName, customerPhone, customerEmail,
            street, unit, postalCode, building, customerRemarks } = req.body;

        if (!jobType || !scheduledDate || !customerName) {
            return res.status(400).json({ message: 'jobType, scheduledDate, and customerName are required' });
        }

        const ticketNumber = await nextTicketNumber();
        const ticket = await JobTicket.create({
            ticketNumber,
            jobType,
            status: 'Scheduled',
            customer: { name: customerName, email: customerEmail, phone: customerPhone },
            siteAddress: { street, unit, postalCode, building },
            scheduledDate: new Date(scheduledDate),
            scheduledTimeSlot,
            customerRemarks,
            createdBy: req.erpUser.id
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error('Customer booking error:', error.message);
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
// Admin/Ops can update anything; technicians can only update status & notes on their jobs
// ────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
    try {
        const ticket = await JobTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Protect immutable fields
        delete req.body.ticketNumber;
        delete req.body.costLines;
        delete req.body.totalMaterialCost;
        delete req.body.grossProfit;

        if (req.erpUser.role === 'Field_Technician') {
            // Technicians can only update status and notes on their assigned jobs
            const isAssigned = ticket.assignedTechnicians.some(t => t.toString() === req.erpUser.id);
            if (!isAssigned) return res.status(403).json({ message: 'You are not assigned to this job' });

            const allowedFields = ['status', 'internalNotes'];
            const allowedStatuses = ['In_Progress', 'On_Hold', 'Completed'];
            if (req.body.status && !allowedStatuses.includes(req.body.status)) {
                return res.status(403).json({ message: 'Technicians can only set status to In_Progress, On_Hold, or Completed' });
            }
            const updates = {};
            allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
            if (req.body.status === 'Completed') updates.completedAt = new Date();

            const updated = await JobTicket.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
                .populate('assignedTechnicians', 'name phone');
            return res.json(updated);
        }

        // Admin/Ops Manager — full update
        if (!['Admin', 'Operations_Manager'].includes(req.erpUser.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const updated = await JobTicket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('assignedTechnicians', 'name phone');
        res.json(updated);
    } catch (error) {
        console.error('Update ticket error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/checkin  — Technician checks in at job site
// Verifies location is within radius of customer site
// ────────────────────────────────────────────────────────────
router.post('/:id/checkin', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });

        const ticket = await JobTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        const isAssigned = ticket.assignedTechnicians.some(t => t.toString() === req.erpUser.id);
        if (!isAssigned && req.erpUser.role === 'Field_Technician') {
            return res.status(403).json({ message: 'You are not assigned to this job' });
        }

        // Check distance if site coordinates exist (radius: 500m)
        if (ticket.tracking?.siteCoordinates?.lat && ticket.tracking?.siteCoordinates?.lng) {
            const dist = haversineDistance(lat, lng, ticket.tracking.siteCoordinates.lat, ticket.tracking.siteCoordinates.lng);
            if (dist > 500) {
                return res.status(400).json({
                    message: `You are ${Math.round(dist)}m from the job site. Please be within 500m to check in.`,
                    distance: Math.round(dist)
                });
            }
        }

        ticket.tracking = ticket.tracking || {};
        ticket.tracking.checkedInAt = new Date();
        ticket.tracking.checkedInLocation = { lat, lng };
        await ticket.save();

        res.json({ message: 'Checked in successfully', checkedInAt: ticket.tracking.checkedInAt });
    } catch (error) {
        console.error('Check-in error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/start  — Technician starts the job (begins timer)
// ────────────────────────────────────────────────────────────
router.post('/:id/start', async (req, res) => {
    try {
        const ticket = await JobTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        const isAssigned = ticket.assignedTechnicians.some(t => t.toString() === req.erpUser.id);
        if (!isAssigned && req.erpUser.role === 'Field_Technician') {
            return res.status(403).json({ message: 'You are not assigned to this job' });
        }

        // Require before photos
        if (!ticket.tracking?.beforeImages || ticket.tracking.beforeImages.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one before photo before starting the job' });
        }

        ticket.tracking = ticket.tracking || {};
        ticket.tracking.startedAt = new Date();
        ticket.status = 'In_Progress';
        await ticket.save();

        res.json({ message: 'Job started', startedAt: ticket.tracking.startedAt, status: ticket.status });
    } catch (error) {
        console.error('Start job error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/complete  — Technician completes the job
// ────────────────────────────────────────────────────────────
router.post('/:id/complete', async (req, res) => {
    try {
        const { technicianNotes } = req.body;
        const ticket = await JobTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        const isAssigned = ticket.assignedTechnicians.some(t => t.toString() === req.erpUser.id);
        if (!isAssigned && req.erpUser.role === 'Field_Technician') {
            return res.status(403).json({ message: 'You are not assigned to this job' });
        }

        // Require after photos
        if (!ticket.tracking?.afterImages || ticket.tracking.afterImages.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one after photo before completing the job' });
        }

        ticket.tracking = ticket.tracking || {};
        ticket.tracking.finishedAt = new Date();
        if (technicianNotes) ticket.tracking.technicianNotes = technicianNotes;

        // Calculate duration
        if (ticket.tracking.startedAt) {
            const diffMs = ticket.tracking.finishedAt - ticket.tracking.startedAt;
            ticket.tracking.durationMinutes = Math.round(diffMs / 60000);
        }

        ticket.status = 'Completed';
        ticket.completedAt = new Date();
        await ticket.save();

        const populated = await JobTicket.findById(ticket._id)
            .populate('assignedTechnicians', 'name phone');
        res.json(populated);
    } catch (error) {
        console.error('Complete job error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /:id/images  — Upload before/after images
// ────────────────────────────────────────────────────────────
router.post('/:id/images', jobUpload.array('images', 10), async (req, res) => {
    try {
        const { type } = req.body; // 'before' or 'after'
        if (!['before', 'after'].includes(type)) {
            return res.status(400).json({ message: 'type must be "before" or "after"' });
        }

        const ticket = await JobTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        const isAssigned = ticket.assignedTechnicians.some(t => t.toString() === req.erpUser.id);
        if (!isAssigned && req.erpUser.role === 'Field_Technician') {
            return res.status(403).json({ message: 'You are not assigned to this job' });
        }

        const imagePaths = (req.files || []).map(f => `/uploads/jobs/${f.filename}`);
        ticket.tracking = ticket.tracking || {};

        if (type === 'before') {
            ticket.tracking.beforeImages = [...(ticket.tracking.beforeImages || []), ...imagePaths];
        } else {
            ticket.tracking.afterImages = [...(ticket.tracking.afterImages || []), ...imagePaths];
        }

        await ticket.save();
        res.json({
            message: `${type} images uploaded`,
            images: type === 'before' ? ticket.tracking.beforeImages : ticket.tracking.afterImages
        });
    } catch (error) {
        console.error('Upload images error:', error.message);
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
