const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const MasterItem = require('../models/MasterItem');
const { verifyERPToken, requireRole } = require('../middleware/erpAuth');

// File upload for Excel import (5MB limit, xlsx/xls only)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only .xlsx and .xls files are allowed'));
    }
});

// All routes require ERP auth
router.use(verifyERPToken);

// ─── GET /sample-template  (download sample Excel) ───
router.get('/sample-template', (req, res) => {
    const sampleData = [
        { sku: 'GAS-R32-10', name: 'Refrigerant Gas R32 10kg', description: 'R32 refrigerant gas cylinder', itemType: 'Consumable', category: 'Gas', uom: 'Cylinder', unitCost: 85, sellingPrice: 150, reorderLevel: 5, brand: 'Daikin', barcode: '8901234567890', minStockLevel: 3, maxStockLevel: 50, supplierName: 'Daikin SG', supplierCode: 'SUP-001' },
        { sku: 'TOOL-VP-001', name: 'Vacuum Pump VP-100', description: 'Professional vacuum pump for aircon servicing', itemType: 'Asset', category: 'Tools', uom: 'Units', unitCost: 450, sellingPrice: 0, reorderLevel: 0, brand: 'Yellow Jacket', barcode: '', minStockLevel: 0, maxStockLevel: 0, supplierName: '', supplierCode: '' },
        { sku: 'COP-PIPE-6M', name: 'Copper Pipe 1/4" 6M', description: '1/4 inch copper pipe, 6 meter length', itemType: 'Consumable', category: 'Pipes', uom: 'Meters', unitCost: 12.5, sellingPrice: 25, reorderLevel: 20, brand: '', barcode: '', minStockLevel: 10, maxStockLevel: 100, supplierName: 'Metal Supply Co', supplierCode: 'SUP-002' },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    // Set column widths
    ws['!cols'] = [
        { wch: 14 }, { wch: 28 }, { wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 },
        { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Items');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=promach-items-template.xlsx');
    res.send(buf);
});

// ─── POST /import  (Admin & Ops Manager — bulk import from Excel) ───
router.post('/import', requireRole('Admin', 'Operations_Manager'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) return res.status(400).json({ message: 'Empty spreadsheet' });

        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (rows.length === 0) return res.status(400).json({ message: 'No data rows found' });
        if (rows.length > 500) return res.status(400).json({ message: 'Maximum 500 rows per import' });

        const validTypes = ['Consumable', 'Asset', 'Kit'];
        const results = { created: 0, skipped: 0, errors: [] };

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // Excel row (header = 1)
            try {
                const sku = String(row.sku || '').trim().toUpperCase();
                const name = String(row.name || '').trim();
                const itemType = String(row.itemType || 'Consumable').trim();

                if (!sku) { results.errors.push(`Row ${rowNum}: SKU is required`); results.skipped++; continue; }
                if (!name) { results.errors.push(`Row ${rowNum}: Name is required`); results.skipped++; continue; }
                if (!validTypes.includes(itemType)) { results.errors.push(`Row ${rowNum}: Invalid type "${itemType}" (use Consumable, Asset, or Kit)`); results.skipped++; continue; }

                // Check for duplicate SKU
                const existing = await MasterItem.findOne({ sku });
                if (existing) { results.errors.push(`Row ${rowNum}: SKU "${sku}" already exists`); results.skipped++; continue; }

                await MasterItem.create({
                    sku,
                    name,
                    description: String(row.description || '').trim(),
                    itemType,
                    category: String(row.category || '').trim(),
                    uom: String(row.uom || 'Units').trim(),
                    unitCost: parseFloat(row.unitCost) || 0,
                    sellingPrice: parseFloat(row.sellingPrice) || 0,
                    reorderLevel: parseFloat(row.reorderLevel) || 0,
                    brand: String(row.brand || '').trim(),
                    barcode: String(row.barcode || '').trim() || undefined,
                    minStockLevel: parseFloat(row.minStockLevel) || 0,
                    maxStockLevel: parseFloat(row.maxStockLevel) || 0,
                    supplier: {
                        name: String(row.supplierName || '').trim(),
                        code: String(row.supplierCode || '').trim(),
                    }
                });
                results.created++;
            } catch (err) {
                results.errors.push(`Row ${rowNum}: ${err.message}`);
                results.skipped++;
            }
        }

        res.json({
            message: `Import complete: ${results.created} created, ${results.skipped} skipped`,
            ...results
        });
    } catch (error) {
        console.error('Import items error:', error.message);
        res.status(500).json({ message: 'Import failed: ' + error.message });
    }
});

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
