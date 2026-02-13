const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CMSData = require('../models/CMSData');
const { verifyToken } = require('./auth');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const certificatesDir = path.join(uploadDir, 'certificates');
const brandsDir = path.join(uploadDir, 'brands');

[uploadDir, certificatesDir, brandsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Multer configuration for certificates (icon + PDF)
const certificateStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, certificatesDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const certificateUpload = multer({
    storage: certificateStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'icon') {
            const allowed = /jpeg|jpg|png|gif|webp|svg/;
            const ext = allowed.test(path.extname(file.originalname).toLowerCase());
            cb(null, ext);
        } else if (file.fieldname === 'pdf') {
            const ext = path.extname(file.originalname).toLowerCase() === '.pdf';
            cb(null, ext);
        } else {
            cb(null, false);
        }
    }
});

// Multer configuration for brand logos
const brandStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, brandsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const brandUpload = multer({
    storage: brandStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|svg/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        cb(null, ext);
    }
});

// GET all CMS data
router.get('/', async (req, res) => {
    try {
        let cms = await CMSData.findOne();

        if (!cms) {
            // Create default CMS data if none exists
            cms = new CMSData({
                pricingTables: [],
                brands: [],
                brandsWithLogos: [],
                certificates: [],
                seo: {},
                companyInfo: {},
                socialMedia: {}
            });
            await cms.save();
        }

        res.json(cms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching CMS data', error: error.message });
    }
});

// PATCH update specific section
router.patch('/:section', verifyToken, async (req, res) => {
    try {
        const { section } = req.params;
        const updateData = req.body;

        let cms = await CMSData.findOne();

        if (!cms) {
            cms = new CMSData();
        }

        // Update the specific section
        cms[section] = updateData;
        await cms.save();

        res.json(cms);
    } catch (error) {
        res.status(500).json({ message: 'Error updating CMS data', error: error.message });
    }
});

// =====================
// PRICING TABLES ROUTES
// =====================

// POST - Create new pricing table
router.post('/pricing-tables', verifyToken, async (req, res) => {
    try {
        const { title, description, headers, data, scopeOfJob, duration } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const newPricingTable = {
            _id: new mongoose.Types.ObjectId(),
            tableId: `table-${Date.now()}`,
            title: title.trim(),
            description: description || '',
            headers: headers || ['No. of Units', 'Price'],
            data: data || [],
            scopeOfJob: scopeOfJob || [],
            duration: duration || '',
            isActive: true,
            order: 0
        };

        // Get current count for order
        const cms = await CMSData.findOne();
        if (cms?.pricingTables) {
            newPricingTable.order = cms.pricingTables.length;
        }

        await CMSData.updateOne(
            {},
            { $push: { pricingTables: newPricingTable } },
            { upsert: true, runValidators: false }
        );

        res.status(201).json({ message: 'Pricing table created successfully', pricingTable: newPricingTable });
    } catch (error) {
        res.status(500).json({ message: 'Error creating pricing table', error: error.message });
    }
});

// PUT - Update pricing table
router.put('/pricing-tables/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, headers, data, scopeOfJob, duration, isActive, order } = req.body;

        const cmsDoc = await CMSData.findOne();
        if (!cmsDoc) {
            return res.status(404).json({ message: 'CMS data not found' });
        }

        const tableIndex = cmsDoc.pricingTables?.findIndex(t => t._id.toString() === id || t.tableId === id);
        if (tableIndex === -1 || tableIndex === undefined) {
            return res.status(404).json({ message: 'Pricing table not found' });
        }

        const table = cmsDoc.pricingTables[tableIndex];

        // Update fields
        if (title !== undefined) table.title = title;
        if (description !== undefined) table.description = description;
        if (headers !== undefined) table.headers = headers;
        if (data !== undefined) table.data = data;
        if (scopeOfJob !== undefined) table.scopeOfJob = scopeOfJob;
        if (duration !== undefined) table.duration = duration;
        if (isActive !== undefined) table.isActive = isActive;
        if (order !== undefined) table.order = order;

        await CMSData.updateOne(
            { _id: cmsDoc._id },
            { $set: { [`pricingTables.${tableIndex}`]: table } },
            { runValidators: false }
        );

        res.json({ message: 'Pricing table updated successfully', pricingTable: table });
    } catch (error) {
        res.status(500).json({ message: 'Error updating pricing table', error: error.message });
    }
});

// DELETE - Remove pricing table
router.delete('/pricing-tables/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new mongoose.Types.ObjectId(id);

        const result = await CMSData.updateOne(
            {},
            { $pull: { pricingTables: { $or: [{ _id: objectId }, { tableId: id }] } } },
            { runValidators: false }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Pricing table not found' });
        }

        res.json({ message: 'Pricing table deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting pricing table', error: error.message });
    }
});

// =====================
// CERTIFICATES ROUTES
// =====================

// POST - Upload new certificate (icon + PDF)
router.post('/certificates', verifyToken, certificateUpload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!req.files?.icon || !req.files?.pdf) {
            return res.status(400).json({ message: 'Both icon and PDF file are required' });
        }

        const iconFile = req.files.icon[0];
        const pdfFile = req.files.pdf[0];

        const newCertificate = {
            _id: new mongoose.Types.ObjectId(),
            name: name || 'Untitled Certificate',
            description: description || '',
            icon: `/uploads/certificates/${iconFile.filename}`,
            file: `/uploads/certificates/${pdfFile.filename}`
        };

        // Use updateOne with $push to avoid full document validation
        await CMSData.updateOne(
            {},
            { $push: { certificates: newCertificate } },
            { upsert: true, runValidators: false }
        );

        res.status(201).json({ message: 'Certificate uploaded successfully', certificate: newCertificate });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading certificate', error: error.message });
    }
});

// PUT - Update existing certificate (name, description, optionally icon/PDF)
router.put('/certificates/:id', verifyToken, certificateUpload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Convert to ObjectId for subdocument query
        const objectId = new mongoose.Types.ObjectId(id);

        // Build update object
        const updateFields = {};
        if (name) updateFields['certificates.$.name'] = name;
        if (description !== undefined) updateFields['certificates.$.description'] = description;

        // Handle new icon upload
        if (req.files?.icon) {
            // Get old icon path to delete later
            const cms = await CMSData.findOne({ 'certificates._id': objectId });
            if (cms) {
                const oldCert = cms.certificates.find(c => c._id.toString() === id);
                if (oldCert?.icon) {
                    const oldIconPath = path.join(__dirname, '../..', oldCert.icon);
                    if (fs.existsSync(oldIconPath)) {
                        fs.unlinkSync(oldIconPath);
                    }
                }
            }
            updateFields['certificates.$.icon'] = `/uploads/certificates/${req.files.icon[0].filename}`;
        }

        // Handle new PDF upload
        if (req.files?.pdf) {
            // Get old PDF path to delete later
            const cms = await CMSData.findOne({ 'certificates._id': objectId });
            if (cms) {
                const oldCert = cms.certificates.find(c => c._id.toString() === id);
                if (oldCert?.file) {
                    const oldPdfPath = path.join(__dirname, '../..', oldCert.file);
                    if (fs.existsSync(oldPdfPath)) {
                        fs.unlinkSync(oldPdfPath);
                    }
                }
            }
            updateFields['certificates.$.file'] = `/uploads/certificates/${req.files.pdf[0].filename}`;
        }

        // Use findOneAndUpdate with runValidators: false to skip validation of old data
        const result = await CMSData.findOneAndUpdate(
            { 'certificates._id': objectId },
            { $set: updateFields },
            { new: true, runValidators: false }
        );

        if (!result) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        const updatedCert = result.certificates.find(c => c._id.toString() === id);
        res.json({ message: 'Certificate updated successfully', certificate: updatedCert });
    } catch (error) {
        res.status(500).json({ message: 'Error updating certificate', error: error.message });
    }
});

// DELETE - Remove certificate
router.delete('/certificates/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new mongoose.Types.ObjectId(id);

        // Get certificate info for file deletion
        const cms = await CMSData.findOne({ 'certificates._id': objectId });
        if (!cms) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        const cert = cms.certificates.find(c => c._id.toString() === id);
        if (!cert) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // Delete files from filesystem
        if (cert.icon) {
            const iconPath = path.join(__dirname, '../..', cert.icon);
            if (fs.existsSync(iconPath)) {
                fs.unlinkSync(iconPath);
            }
        }
        if (cert.file) {
            const pdfPath = path.join(__dirname, '../..', cert.file);
            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }
        }

        // Use updateOne with $pull to avoid full document validation
        await CMSData.updateOne(
            {},
            { $pull: { certificates: { _id: objectId } } },
            { runValidators: false }
        );

        res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting certificate', error: error.message });
    }
});

// =====================
// BRAND LOGOS ROUTES
// =====================

// POST - Upload new brand (logo is optional)
router.post('/brands', verifyToken, brandUpload.single('logo'), async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        // Get current brand count for order
        const cms = await CMSData.findOne();
        const currentCount = cms?.brandsWithLogos?.length || 0;

        const newBrand = {
            _id: new mongoose.Types.ObjectId(),
            name: name.trim(),
            logo: req.file ? `/uploads/brands/${req.file.filename}` : null,
            isActive: true,
            order: currentCount
        };

        // Use updateOne with $push to avoid full document validation
        await CMSData.updateOne(
            {},
            { $push: { brandsWithLogos: newBrand } },
            { upsert: true, runValidators: false }
        );

        res.status(201).json({ message: 'Brand added successfully', brand: newBrand });
    } catch (error) {
        res.status(500).json({ message: 'Error adding brand', error: error.message });
    }
});

// DELETE - Remove brand
router.delete('/brands/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new mongoose.Types.ObjectId(id);

        // Get brand info for file deletion
        const cms = await CMSData.findOne({ 'brandsWithLogos._id': objectId });
        if (!cms) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        const brand = cms.brandsWithLogos.find(b => b._id.toString() === id);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        // Delete logo file from filesystem if it's a local file
        if (brand.logo && brand.logo.startsWith('/uploads/')) {
            const logoPath = path.join(__dirname, '../..', brand.logo);
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }

        // Use updateOne with $pull to avoid full document validation
        await CMSData.updateOne(
            {},
            { $pull: { brandsWithLogos: { _id: objectId } } },
            { runValidators: false }
        );

        res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting brand', error: error.message });
    }
});

// PATCH - Update brand (name, status, order, or logo)
router.patch('/brands/:id', verifyToken, brandUpload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, order, name } = req.body;

        console.log('PATCH /brands/:id - Received ID:', id);

        // First, try to find the CMS document and check if this brand exists
        const cmsDoc = await CMSData.findOne();
        if (!cmsDoc) {
            return res.status(404).json({ message: 'CMS data not found' });
        }

        console.log('Brands in database:', cmsDoc.brandsWithLogos?.map(b => ({ id: b._id.toString(), name: b.name })));

        // Find the brand in the array
        const brandIndex = cmsDoc.brandsWithLogos?.findIndex(b => b._id.toString() === id);
        console.log('Brand index found:', brandIndex);

        if (brandIndex === -1 || brandIndex === undefined) {
            return res.status(404).json({ message: 'Brand not found', searchedId: id });
        }

        const brand = cmsDoc.brandsWithLogos[brandIndex];

        // Update fields
        if (name) brand.name = name;
        if (isActive !== undefined) brand.isActive = isActive === 'true' || isActive === true;
        if (order !== undefined) brand.order = parseInt(order);

        // Handle new logo upload
        if (req.file) {
            // Delete old logo if exists
            if (brand.logo) {
                const oldLogoPath = path.join(__dirname, '../..', brand.logo);
                if (fs.existsSync(oldLogoPath)) {
                    fs.unlinkSync(oldLogoPath);
                }
            }
            brand.logo = `/uploads/brands/${req.file.filename}`;
        }

        // Save using updateOne with runValidators: false
        await CMSData.updateOne(
            { _id: cmsDoc._id },
            { $set: { [`brandsWithLogos.${brandIndex}`]: brand } },
            { runValidators: false }
        );

        res.json({ message: 'Brand updated successfully', brand });
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ message: 'Error updating brand', error: error.message });
    }
});

// =========================
// BCA REGISTRATIONS ROUTES
// =========================

// PUT - Update entire BCA registrations section (company info + section settings)
router.put('/bca-registrations', verifyToken, async (req, res) => {
    try {
        const { sectionTitle, companyName, uen, bcaUrl } = req.body;

        let cms = await CMSData.findOne();
        if (!cms) {
            cms = new CMSData();
        }

        if (!cms.bcaRegistrations) {
            cms.bcaRegistrations = {};
        }

        if (sectionTitle !== undefined) cms.bcaRegistrations.sectionTitle = sectionTitle;
        if (companyName !== undefined) cms.bcaRegistrations.companyName = companyName;
        if (uen !== undefined) cms.bcaRegistrations.uen = uen;
        if (bcaUrl !== undefined) cms.bcaRegistrations.bcaUrl = bcaUrl;

        await cms.save();
        res.json({ message: 'BCA registrations updated successfully', bcaRegistrations: cms.bcaRegistrations });
    } catch (error) {
        res.status(500).json({ message: 'Error updating BCA registrations', error: error.message });
    }
});

// POST - Add registered contractor
router.post('/bca-registrations/contractors', verifyToken, async (req, res) => {
    try {
        const { workhead, description, grade, expiryDate } = req.body;

        if (!workhead || !description) {
            return res.status(400).json({ message: 'Workhead and description are required' });
        }

        const newContractor = {
            _id: new mongoose.Types.ObjectId(),
            workhead: workhead.trim(),
            description: description.trim(),
            grade: grade || '',
            expiryDate: expiryDate || '',
            isActive: true
        };

        await CMSData.updateOne(
            {},
            { $push: { 'bcaRegistrations.registeredContractors': newContractor } },
            { upsert: true, runValidators: false }
        );

        res.status(201).json({ message: 'Contractor added successfully', contractor: newContractor });
    } catch (error) {
        res.status(500).json({ message: 'Error adding contractor', error: error.message });
    }
});

// PUT - Update registered contractor
router.put('/bca-registrations/contractors/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { workhead, description, grade, expiryDate, isActive } = req.body;

        const cmsDoc = await CMSData.findOne();
        if (!cmsDoc || !cmsDoc.bcaRegistrations?.registeredContractors) {
            return res.status(404).json({ message: 'Contractors not found' });
        }

        const contractorIndex = cmsDoc.bcaRegistrations.registeredContractors.findIndex(
            c => c._id.toString() === id
        );

        if (contractorIndex === -1) {
            return res.status(404).json({ message: 'Contractor not found' });
        }

        const contractor = cmsDoc.bcaRegistrations.registeredContractors[contractorIndex];
        if (workhead !== undefined) contractor.workhead = workhead;
        if (description !== undefined) contractor.description = description;
        if (grade !== undefined) contractor.grade = grade;
        if (expiryDate !== undefined) contractor.expiryDate = expiryDate;
        if (isActive !== undefined) contractor.isActive = isActive;

        await CMSData.updateOne(
            { _id: cmsDoc._id },
            { $set: { [`bcaRegistrations.registeredContractors.${contractorIndex}`]: contractor } },
            { runValidators: false }
        );

        res.json({ message: 'Contractor updated successfully', contractor });
    } catch (error) {
        res.status(500).json({ message: 'Error updating contractor', error: error.message });
    }
});

// DELETE - Remove registered contractor
router.delete('/bca-registrations/contractors/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new mongoose.Types.ObjectId(id);

        const result = await CMSData.updateOne(
            {},
            { $pull: { 'bcaRegistrations.registeredContractors': { _id: objectId } } },
            { runValidators: false }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Contractor not found' });
        }

        res.json({ message: 'Contractor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting contractor', error: error.message });
    }
});

// POST - Add licensed builder
router.post('/bca-registrations/builders', verifyToken, async (req, res) => {
    try {
        const { licensingCode, description, expiryDate } = req.body;

        if (!licensingCode || !description) {
            return res.status(400).json({ message: 'Licensing code and description are required' });
        }

        const newBuilder = {
            _id: new mongoose.Types.ObjectId(),
            licensingCode: licensingCode.trim(),
            description: description.trim(),
            expiryDate: expiryDate || '',
            isActive: true
        };

        await CMSData.updateOne(
            {},
            { $push: { 'bcaRegistrations.licensedBuilders': newBuilder } },
            { upsert: true, runValidators: false }
        );

        res.status(201).json({ message: 'Builder added successfully', builder: newBuilder });
    } catch (error) {
        res.status(500).json({ message: 'Error adding builder', error: error.message });
    }
});

// PUT - Update licensed builder
router.put('/bca-registrations/builders/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { licensingCode, description, expiryDate, isActive } = req.body;

        const cmsDoc = await CMSData.findOne();
        if (!cmsDoc || !cmsDoc.bcaRegistrations?.licensedBuilders) {
            return res.status(404).json({ message: 'Builders not found' });
        }

        const builderIndex = cmsDoc.bcaRegistrations.licensedBuilders.findIndex(
            b => b._id.toString() === id
        );

        if (builderIndex === -1) {
            return res.status(404).json({ message: 'Builder not found' });
        }

        const builder = cmsDoc.bcaRegistrations.licensedBuilders[builderIndex];
        if (licensingCode !== undefined) builder.licensingCode = licensingCode;
        if (description !== undefined) builder.description = description;
        if (expiryDate !== undefined) builder.expiryDate = expiryDate;
        if (isActive !== undefined) builder.isActive = isActive;

        await CMSData.updateOne(
            { _id: cmsDoc._id },
            { $set: { [`bcaRegistrations.licensedBuilders.${builderIndex}`]: builder } },
            { runValidators: false }
        );

        res.json({ message: 'Builder updated successfully', builder });
    } catch (error) {
        res.status(500).json({ message: 'Error updating builder', error: error.message });
    }
});

// DELETE - Remove licensed builder
router.delete('/bca-registrations/builders/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new mongoose.Types.ObjectId(id);

        const result = await CMSData.updateOne(
            {},
            { $pull: { 'bcaRegistrations.licensedBuilders': { _id: objectId } } },
            { runValidators: false }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Builder not found' });
        }

        res.json({ message: 'Builder deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting builder', error: error.message });
    }
});

// ===================
// CRO SETTINGS ROUTES
// ===================

// GET - Get all CRO settings
router.get('/cro-settings', async (req, res) => {
    try {
        let cms = await CMSData.findOne();

        if (!cms) {
            cms = new CMSData();
            await cms.save();
        }

        // Default CRO settings with testimonials
        const defaultCroSettings = {
            discountOffer: {
                isEnabled: true,
                discountAmount: '$20',
                discountText: '$20 OFF your first service!',
                expiryHours: 24,
                ctaText: 'Claim Now'
            },
            urgencyBanner: {
                isEnabled: true,
                message: 'Limited Time: $20 OFF your first service!',
                ctaText: 'Claim Now →',
                backgroundColor: 'primary'
            },
            exitIntentPopup: {
                isEnabled: true,
                title: "Wait! Don't Leave Yet",
                subtitle: 'Get $20 OFF your first service when you book with us!',
                discountAmount: '$20 OFF',
                ctaText: 'Claim My $20 Discount',
                dismissText: "No thanks, I don't want to save money"
            },
            trustBadges: {
                yearsExperience: '13+',
                happyCustomers: '5,000+',
                certifications: '4x ISO',
                guarantee: 'BCA Registered'
            },
            testimonials: [
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'Sarah Tan',
                    location: 'Bishan, HDB',
                    rating: 5,
                    text: 'Excellent service! The technicians were punctual and professional. My aircon is now cooling like new after the chemical wash. Highly recommended!',
                    serviceType: 'aircon',
                    date: '2 weeks ago',
                    isActive: true
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'David Lim',
                    location: 'Tampines, Condo',
                    rating: 5,
                    text: 'Promach transformed our old condo into a modern home. The team was patient with our requests and delivered beyond expectations. Great quality!',
                    serviceType: 'renovation',
                    date: '1 month ago',
                    isActive: true
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'Michelle Wong',
                    location: 'Jurong, Office',
                    rating: 5,
                    text: "We've been using Promach for our office aircon maintenance for 3 years. Always reliable and responsive. Their contract pricing is very competitive.",
                    serviceType: 'aircon',
                    date: '3 weeks ago',
                    isActive: true
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'Ahmad Rahman',
                    location: 'Woodlands, HDB',
                    rating: 5,
                    text: 'Fast response and fair pricing. The technician explained everything clearly before starting work. Will definitely use them again.',
                    serviceType: 'aircon',
                    date: '1 week ago',
                    isActive: true
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    name: 'Jennifer Lee',
                    location: 'Bukit Timah, Landed',
                    rating: 5,
                    text: 'From design to completion, the Promach team was professional and delivered on time. Our kitchen renovation looks amazing!',
                    serviceType: 'renovation',
                    date: '2 months ago',
                    isActive: true
                }
            ],
            quickQuoteModal: {
                isEnabled: true,
                title: 'Get Your Free Quote',
                subtitle: 'Takes less than 60 seconds'
            },
            mobileCTABar: {
                isEnabled: true,
                showCallButton: true,
                showWhatsAppButton: true,
                showQuoteButton: true
            }
        };

        // If croSettings doesn't exist or testimonials are empty, seed defaults
        if (!cms.croSettings || !cms.croSettings.testimonials || cms.croSettings.testimonials.length === 0) {
            const existingSettings = cms.croSettings && typeof cms.croSettings.toObject === 'function'
                ? cms.croSettings.toObject()
                : (cms.croSettings || {});

            // Remove _id from existing settings to avoid conflicts if present
            delete existingSettings._id;

            cms.croSettings = {
                ...defaultCroSettings,
                ...existingSettings,
                testimonials: defaultCroSettings.testimonials
            };
            await cms.save();
        }

        res.json(cms.croSettings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching CRO settings', error: error.message });
    }
});

// PUT - Update CRO settings (all sections)
router.put('/cro-settings', verifyToken, async (req, res) => {
    try {
        const { discountOffer, urgencyBanner, exitIntentPopup, trustBadges, quickQuoteModal, mobileCTABar } = req.body;

        let cms = await CMSData.findOne();
        if (!cms) {
            cms = new CMSData();
        }

        if (!cms.croSettings) {
            cms.croSettings = {};
        }

        // Update each section if provided
        if (discountOffer !== undefined) cms.croSettings.discountOffer = { ...cms.croSettings.discountOffer, ...discountOffer };
        if (urgencyBanner !== undefined) cms.croSettings.urgencyBanner = { ...cms.croSettings.urgencyBanner, ...urgencyBanner };
        if (exitIntentPopup !== undefined) cms.croSettings.exitIntentPopup = { ...cms.croSettings.exitIntentPopup, ...exitIntentPopup };
        if (trustBadges !== undefined) cms.croSettings.trustBadges = { ...cms.croSettings.trustBadges, ...trustBadges };
        if (quickQuoteModal !== undefined) cms.croSettings.quickQuoteModal = { ...cms.croSettings.quickQuoteModal, ...quickQuoteModal };
        if (mobileCTABar !== undefined) cms.croSettings.mobileCTABar = { ...cms.croSettings.mobileCTABar, ...mobileCTABar };

        await cms.save();
        res.json({ message: 'CRO settings updated successfully', croSettings: cms.croSettings });
    } catch (error) {
        res.status(500).json({ message: 'Error updating CRO settings', error: error.message });
    }
});

// =====================
// TESTIMONIALS ROUTES
// =====================

// POST - Add testimonial
router.post('/cro-settings/testimonials', verifyToken, async (req, res) => {
    try {
        const { name, location, rating, text, serviceType, date } = req.body;

        if (!name || !text) {
            return res.status(400).json({ message: 'Name and review text are required' });
        }

        const newTestimonial = {
            _id: new mongoose.Types.ObjectId(),
            name: name.trim(),
            location: location || 'Singapore',
            rating: rating || 5,
            text: text.trim(),
            serviceType: serviceType || 'aircon',
            date: date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            isActive: true
        };

        await CMSData.updateOne(
            {},
            { $push: { 'croSettings.testimonials': newTestimonial } },
            { upsert: true, runValidators: false }
        );

        res.status(201).json({ message: 'Testimonial added successfully', testimonial: newTestimonial });
    } catch (error) {
        res.status(500).json({ message: 'Error adding testimonial', error: error.message });
    }
});

// PUT - Update testimonial
router.put('/cro-settings/testimonials/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, rating, text, serviceType, date, isActive } = req.body;

        const cmsDoc = await CMSData.findOne();
        if (!cmsDoc || !cmsDoc.croSettings?.testimonials) {
            return res.status(404).json({ message: 'Testimonials not found' });
        }

        const testimonialIndex = cmsDoc.croSettings.testimonials.findIndex(t => t._id.toString() === id);
        if (testimonialIndex === -1) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        const testimonial = cmsDoc.croSettings.testimonials[testimonialIndex];
        if (name !== undefined) testimonial.name = name;
        if (location !== undefined) testimonial.location = location;
        if (rating !== undefined) testimonial.rating = rating;
        if (text !== undefined) testimonial.text = text;
        if (serviceType !== undefined) testimonial.serviceType = serviceType;
        if (date !== undefined) testimonial.date = date;
        if (isActive !== undefined) testimonial.isActive = isActive;

        await CMSData.updateOne(
            { _id: cmsDoc._id },
            { $set: { [`croSettings.testimonials.${testimonialIndex}`]: testimonial } },
            { runValidators: false }
        );

        res.json({ message: 'Testimonial updated successfully', testimonial });
    } catch (error) {
        res.status(500).json({ message: 'Error updating testimonial', error: error.message });
    }
});

// DELETE - Remove testimonial
router.delete('/cro-settings/testimonials/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new mongoose.Types.ObjectId(id);

        const result = await CMSData.updateOne(
            {},
            { $pull: { 'croSettings.testimonials': { _id: objectId } } },
            { runValidators: false }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Testimonial not found' });
        }

        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting testimonial', error: error.message });
    }
});

module.exports = router;

