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
const sustainabilityDir = path.join(uploadDir, 'sustainability');

[uploadDir, certificatesDir, brandsDir, sustainabilityDir].forEach(dir => {
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
        res.status(500).json({ message: 'Error fetching CMS data' });
    }
});

// PATCH update specific section
router.patch('/:section', verifyToken, async (req, res) => {
    try {
        const { section } = req.params;
        const updateData = req.body;

        // Whitelist allowed sections to prevent arbitrary property injection
        const allowedSections = [
            'pricingTables', 'additionalServices', 'brands', 'brandsWithLogos',
            'certificates', 'seo', 'companyInfo', 'socialMedia',
            'aboutPage', 'contactPage', 'bcaRegistrations', 'croSettings',
            'sustainabilityPage'
        ];

        if (!allowedSections.includes(section)) {
            return res.status(400).json({ message: 'Invalid section' });
        }

        let cms = await CMSData.findOne();

        if (!cms) {
            cms = new CMSData();
        }

        // Update the specific section
        cms[section] = updateData;
        await cms.save();

        res.json(cms);
    } catch (error) {
        res.status(500).json({ message: 'Error updating CMS data' });
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
        res.status(500).json({ message: 'Error creating pricing table' });
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
        res.status(500).json({ message: 'Error updating pricing table' });
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
        res.status(500).json({ message: 'Error deleting pricing table' });
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
        res.status(500).json({ message: 'Error uploading certificate' });
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
        res.status(500).json({ message: 'Error updating certificate' });
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
        res.status(500).json({ message: 'Error deleting certificate' });
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
        res.status(500).json({ message: 'Error adding brand' });
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
        res.status(500).json({ message: 'Error deleting brand' });
    }
});

// PATCH - Update brand (name, status, order, or logo)
router.patch('/brands/:id', verifyToken, brandUpload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, order, name } = req.body;

        // First, try to find the CMS document and check if this brand exists
        const cmsDoc = await CMSData.findOne();
        if (!cmsDoc) {
            return res.status(404).json({ message: 'CMS data not found' });
        }

        // Find the brand in the array
        const brandIndex = cmsDoc.brandsWithLogos?.findIndex(b => b._id.toString() === id);

        if (brandIndex === -1 || brandIndex === undefined) {
            return res.status(404).json({ message: 'Brand not found' });
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
        res.status(500).json({ message: 'Error updating brand' });
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
        res.status(500).json({ message: 'Error updating BCA registrations' });
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
        res.status(500).json({ message: 'Error adding contractor' });
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
        res.status(500).json({ message: 'Error updating contractor' });
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
        res.status(500).json({ message: 'Error deleting contractor' });
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
        res.status(500).json({ message: 'Error adding builder' });
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
        res.status(500).json({ message: 'Error updating builder' });
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
        res.status(500).json({ message: 'Error deleting builder' });
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
        res.status(500).json({ message: 'Error fetching CRO settings' });
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
        res.status(500).json({ message: 'Error updating CRO settings' });
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
        res.status(500).json({ message: 'Error adding testimonial' });
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
        res.status(500).json({ message: 'Error updating testimonial' });
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
        res.status(500).json({ message: 'Error deleting testimonial' });
    }
});

// =============================
// SUSTAINABILITY PAGE ROUTES
// =============================

// Default sustainability content (used when the section is empty)
const DEFAULT_SUSTAINABILITY = {
    hero: {
        title: 'Sustainability Policy & Commitment',
        subtitle: 'Promach Pte. Ltd. is committed to delivering engineering and building services solutions in a responsible and sustainable manner \u2014 integrating energy efficiency, environmental compliance, and resource optimization into every project.',
        badge: 'ISO 14001 Certified'
    },
    commitment: {
        title: 'Our Commitment',
        paragraphs: [
            'Promach Pte. Ltd. is committed to delivering engineering and building services solutions in a responsible and sustainable manner. We support our clients\u2019 sustainability objectives by integrating energy efficiency, environmental compliance, and resource optimization into our operations and project execution.',
            'Our approach is aligned with applicable Singapore regulations, industry best practices, and continuous improvement principles, while ensuring that sustainability measures remain practical, safe, and technically suitable for each project.'
        ]
    },
    framework: {
        title: 'Sustainability Framework',
        intro: 'Our sustainability practices are guided by structured management systems and operational controls that support consistent environmental performance. Promach operates under the following certified frameworks:',
        outro: 'These frameworks support our commitment towards compliance, waste reduction, efficient resource usage, and continual improvement.',
        standards: [
            { code: 'ISO 14001', name: 'Environmental Management System', description: 'Structured controls for environmental performance and compliance, ensuring continual improvement in our environmental impact across all projects.', isActive: true, order: 0 },
            { code: 'ISO 9001', name: 'Quality Management System', description: 'Consistent quality across every project we deliver, with systematic processes that ensure reliability and client satisfaction.', isActive: true, order: 1 },
            { code: 'ISO 45001', name: 'Occupational Health & Safety Management System', description: 'Safe operations that protect our workforce and partners, with proactive risk management and continuous safety improvement.', isActive: true, order: 2 },
            { code: 'ISO 37001', name: 'Anti-Bribery Management System', description: 'Certified anti-bribery management system ensuring ethical business practices and transparency in all operations.', isActive: true, order: 3 },
            { code: 'BizSAFE STAR', name: 'Workplace Safety & Health Council Recognition', description: 'Highest tier of BizSAFE recognition in Singapore, demonstrating our commitment to workplace safety and health excellence.', isActive: true, order: 4 }
        ]
    },
    focusAreas: {
        title: 'Key Focus Areas',
        subtitle: 'Six pillars that guide how we plan, execute, and improve every project \u2014 ensuring environmental responsibility at every stage.',
        items: [
            { title: 'Energy Efficiency', description: 'Promach promotes the use of energy-efficient ACMV and mechanical systems where applicable. Proper installation, testing, commissioning, and maintenance practices are implemented to improve system performance and reduce unnecessary energy consumption.', icon: 'Zap', isActive: true, order: 0 },
            { title: 'Environmental Protection', description: 'We support environmentally responsible solutions, including the use of compliant refrigerants with lower Global Warming Potential (GWP), where technically feasible and aligned with project requirements.', icon: 'Globe', isActive: true, order: 1 },
            { title: 'Waste Management & Recycling', description: 'Promach adopts proper segregation, recycling, and disposal practices for replaced or removed materials through licensed waste contractors, in accordance with regulatory requirements.', icon: 'Recycle', isActive: true, order: 2 },
            { title: 'Resource Optimization', description: 'We reduce material wastage through careful planning, proper quantity control, and reuse of existing serviceable materials where safe and feasible.', icon: 'Package', isActive: true, order: 3 },
            { title: 'Lifecycle & Durability', description: 'Promach emphasizes the selection of durable and corrosion-resistant materials to extend equipment lifespan, reduce replacement frequency, and lower long-term environmental impact.', icon: 'Shield', isActive: true, order: 4 },
            { title: 'Digitalization', description: 'Promach adopts digital documentation and electronic submission systems to enhance operational efficiency and reduce paper consumption. Through the use of digital platforms, system monitoring dashboards, and data-driven reporting tools, we improve workflow transparency, streamline communication, and support more efficient project management and maintenance operations. Digitalization also enables better tracking of system performance, timely reporting, and improved decision-making, contributing to overall efficiency and sustainability in project execution.', icon: 'Monitor', isActive: true, order: 5 }
        ]
    },
    targets: {
        title: 'Our Sustainability Targets',
        subtitle: 'We are committed to driving responsible practices that create long-term value for our projects, people, and the environment.',
        items: [
            { title: 'Waste Reduction', description: 'Reduce material wastage through improved planning and reuse practices.', icon: 'Recycle', isActive: true, order: 0 },
            { title: 'Energy Efficiency', description: 'Promote energy-efficient systems where technically feasible.', icon: 'Zap', isActive: true, order: 1 },
            { title: 'Recycling', description: 'Ensure proper disposal of waste materials through licensed contractors.', icon: 'Trash2', isActive: true, order: 2 },
            { title: 'Compliance', description: 'Maintain full compliance with environmental regulations and industry standards.', icon: 'ShieldCheck', isActive: true, order: 3 },
            { title: 'Continuous Improvement', description: 'Continuously improve environmental performance under our ISO 14001 framework.', icon: 'TrendingUp', isActive: true, order: 4 },
            { title: 'Preventive Maintenance', description: 'Enhance preventive maintenance practices to improve system efficiency and lifespan.', icon: 'Wrench', isActive: true, order: 5 }
        ]
    },
    implementation: {
        title: 'Our Project Implementation Approach',
        subtitle: 'Sustainability is incorporated into our project lifecycle through every key stage \u2014 ensuring responsible, efficient, and high-quality outcomes.',
        steps: [
            { title: 'Planning', description: 'Efficient planning and coordination to reduce abortive works and improve resource utilization.', icon: 'ClipboardList', isActive: true, order: 0 },
            { title: 'Procurement', description: 'Responsible sourcing and optimized logistics to minimize unnecessary transport movements.', icon: 'ShoppingCart', isActive: true, order: 1 },
            { title: 'Installation', description: 'Proper installation and commissioning practices to ensure system efficiency and reliability.', icon: 'HardHat', isActive: true, order: 2 },
            { title: 'Waste Handling', description: 'Responsible handling, segregation, and disposal of removed and replaced materials through licensed contractors.', icon: 'Recycle', isActive: true, order: 3 },
            { title: 'Testing & Commissioning', description: 'Rigorous testing and commissioning to verify system performance and ensure compliance.', icon: 'CheckCircle', isActive: true, order: 4 },
            { title: 'Maintenance', description: 'Preventive maintenance to improve performance, extend service life, and reduce long-term environmental impact.', icon: 'Wrench', isActive: true, order: 5 }
        ]
    },
    alternatives: {
        title: 'Sustainable Alternatives We Offer',
        subtitle: 'Promach Pte. Ltd. supports Singtel\u2019s sustainability objectives by adopting practical, efficient, and environmentally responsible approaches in our project execution. The following sustainable alternatives can be considered, subject to Client approval, site conditions, and technical suitability:',
        items: [
            { title: 'Energy Efficiency Enhancement', description: 'Adoption of energy-efficient equipment and systems where applicable, with optimization of installation and commissioning practices to ensure efficient operation, reduced energy consumption, and improved system performance.', icon: 'Zap', isActive: true, order: 0 },
            { title: 'Environmentally Responsible Refrigerants', description: 'Preference for systems utilizing low Global Warming Potential (GWP) refrigerants, where compliant with NEA regulations and aligned with project specifications.', icon: 'Snowflake', isActive: true, order: 1 },
            { title: 'Material Optimization and Reuse', description: 'Reuse of existing serviceable materials such as supports, containment, and piping routes where feasible, to minimize material wastage and reduce environmental impact.', icon: 'Layers', isActive: true, order: 2 },
            { title: 'Waste Management and Recycling', description: 'Proper segregation, recycling, and disposal of replaced materials through licensed waste contractors, in accordance with environmental regulations and best practices.', icon: 'Recycle', isActive: true, order: 3 },
            { title: 'Durable Material Selection', description: 'Use of corrosion-resistant and durable materials to extend equipment lifespan, thereby reducing replacement frequency and long-term environmental impact.', icon: 'Shield', isActive: true, order: 4 },
            { title: 'Resource and Logistics Efficiency', description: 'Careful planning of materials and work sequences to minimize over-ordering, abortive works, and unnecessary transportation, contributing to reduced carbon footprint.', icon: 'Truck', isActive: true, order: 5 },
            { title: 'Digital Documentation', description: 'Adoption of digital submissions, reports, and documentation where possible to reduce paper consumption and improve efficiency.', icon: 'Monitor', isActive: true, order: 6 },
            { title: 'Preventive Maintenance Approach', description: 'Implementation of effective maintenance strategies to enhance system efficiency, reduce operational losses, and prolong asset life.', icon: 'Wrench', isActive: true, order: 7 }
        ]
    },
    continuousImprovement: {
        title: 'Continuous Improvement',
        paragraphs: [
            'Promach remains committed to continuously improving our sustainability practices in line with evolving regulatory requirements, industry standards, and client expectations.',
            'We will continue to strengthen our processes, awareness, and implementation practices to support responsible and sustainable project delivery.'
        ]
    },
    disclaimer: 'All sustainability initiatives described herein are implemented on a best-effort basis and are subject to project specifications, site conditions, technical feasibility, applicable approvals, and Client requirements. Promach Pte. Ltd. shall not be held liable for any design changes, performance variations, or cost implications arising from the adoption of sustainability alternatives beyond the agreed contractual scope. All proposed alternatives are indicative and shall be subject to Client approval, consultant requirements, and project specifications.',
    documents: []
};

function hasSustainabilityContent(cms) {
    const s = cms?.sustainabilityPage;
    if (!s) return false;
    return !!(
        s.focusAreas?.items?.length ||
        s.targets?.items?.length ||
        s.implementation?.steps?.length ||
        s.alternatives?.items?.length ||
        s.framework?.standards?.length
    );
}

// GET - Get sustainability content (seeds defaults if empty)
router.get('/sustainability', async (req, res) => {
    try {
        let cms = await CMSData.findOne();
        if (!cms) {
            cms = new CMSData();
        }
        if (!hasSustainabilityContent(cms)) {
            cms.sustainabilityPage = DEFAULT_SUSTAINABILITY;
            await cms.save();
        }
        res.json(cms.sustainabilityPage);
    } catch (error) {
        console.error('Error fetching sustainability:', error);
        res.status(500).json({ message: 'Error fetching sustainability content' });
    }
});

// PUT - Update sustainability page (partial merge per top-level key)
router.put('/sustainability', verifyToken, async (req, res) => {
    try {
        const updates = req.body || {};
        let cms = await CMSData.findOne();
        if (!cms) cms = new CMSData();

        if (!cms.sustainabilityPage) cms.sustainabilityPage = {};

        // Merge each provided top-level section
        Object.keys(updates).forEach(key => {
            cms.sustainabilityPage[key] = updates[key];
        });

        await cms.save();
        res.json(cms.sustainabilityPage);
    } catch (error) {
        console.error('Error updating sustainability:', error);
        res.status(500).json({ message: 'Error updating sustainability content' });
    }
});

// Generic helper for subdocument list endpoints
// listKey examples: 'focusAreas.items', 'targets.items', 'implementation.steps',
// 'alternatives.items', 'framework.standards'
function buildSubRoutes(routeName, listPath) {
    // POST add
    router.post(`/sustainability/${routeName}`, verifyToken, async (req, res) => {
        try {
            const newItem = {
                _id: new mongoose.Types.ObjectId(),
                ...req.body,
                isActive: req.body.isActive !== undefined ? req.body.isActive : true,
                order: req.body.order !== undefined ? req.body.order : 0
            };
            await CMSData.updateOne(
                {},
                { $push: { [`sustainabilityPage.${listPath}`]: newItem } },
                { upsert: true, runValidators: false }
            );
            res.status(201).json(newItem);
        } catch (error) {
            console.error(`Error adding ${routeName}:`, error);
            res.status(500).json({ message: `Error adding ${routeName}` });
        }
    });

    // PUT update
    router.put(`/sustainability/${routeName}/:id`, verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const cms = await CMSData.findOne();
            if (!cms) return res.status(404).json({ message: 'CMS not found' });

            const segments = listPath.split('.');
            const list = segments.reduce((obj, key) => obj?.[key], cms.sustainabilityPage);
            if (!Array.isArray(list)) return res.status(404).json({ message: 'List not found' });

            const index = list.findIndex(i => i._id?.toString() === id);
            if (index === -1) return res.status(404).json({ message: 'Item not found' });

            list[index] = { ...list[index].toObject?.() || list[index], ...req.body, _id: list[index]._id };
            await CMSData.updateOne(
                { _id: cms._id },
                { $set: { [`sustainabilityPage.${listPath}.${index}`]: list[index] } },
                { runValidators: false }
            );
            res.json(list[index]);
        } catch (error) {
            console.error(`Error updating ${routeName}:`, error);
            res.status(500).json({ message: `Error updating ${routeName}` });
        }
    });

    // DELETE
    router.delete(`/sustainability/${routeName}/:id`, verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const objectId = new mongoose.Types.ObjectId(id);
            await CMSData.updateOne(
                {},
                { $pull: { [`sustainabilityPage.${listPath}`]: { _id: objectId } } },
                { runValidators: false }
            );
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            console.error(`Error deleting ${routeName}:`, error);
            res.status(500).json({ message: `Error deleting ${routeName}` });
        }
    });
}

buildSubRoutes('standards', 'framework.standards');
buildSubRoutes('focus-areas', 'focusAreas.items');
buildSubRoutes('targets', 'targets.items');
buildSubRoutes('implementation-steps', 'implementation.steps');
buildSubRoutes('alternatives', 'alternatives.items');

// ===============
// DOCUMENT UPLOAD
// ===============
const sustainabilityStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, sustainabilityDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const sustainabilityUpload = multer({
    storage: sustainabilityStorage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, ext === '.pdf');
    }
});

router.post('/sustainability/documents', verifyToken, sustainabilityUpload.single('file'), async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!req.file) return res.status(400).json({ message: 'PDF file is required' });

        const newDoc = {
            _id: new mongoose.Types.ObjectId(),
            name: name || req.file.originalname,
            description: description || '',
            file: `/uploads/sustainability/${req.file.filename}`,
            isActive: true,
            order: 0
        };

        await CMSData.updateOne(
            {},
            { $push: { 'sustainabilityPage.documents': newDoc } },
            { upsert: true, runValidators: false }
        );

        res.status(201).json(newDoc);
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
});

router.put('/sustainability/documents/:id', verifyToken, sustainabilityUpload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const cms = await CMSData.findOne();
        if (!cms) return res.status(404).json({ message: 'CMS not found' });

        const docs = cms.sustainabilityPage?.documents || [];
        const index = docs.findIndex(d => d._id?.toString() === id);
        if (index === -1) return res.status(404).json({ message: 'Document not found' });

        const current = docs[index].toObject ? docs[index].toObject() : docs[index];
        const updated = {
            ...current,
            name: req.body.name ?? current.name,
            description: req.body.description ?? current.description,
            isActive: req.body.isActive !== undefined ? req.body.isActive : current.isActive
        };

        if (req.file) {
            // Remove old file if it exists
            if (current.file) {
                const oldPath = path.join(__dirname, '../..', current.file);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
                }
            }
            updated.file = `/uploads/sustainability/${req.file.filename}`;
        }

        await CMSData.updateOne(
            { _id: cms._id },
            { $set: { [`sustainabilityPage.documents.${index}`]: updated } },
            { runValidators: false }
        );

        res.json(updated);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Error updating document' });
    }
});

router.delete('/sustainability/documents/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const cms = await CMSData.findOne();
        if (!cms) return res.status(404).json({ message: 'CMS not found' });

        const doc = cms.sustainabilityPage?.documents?.find(d => d._id?.toString() === id);
        if (doc?.file) {
            const filePath = path.join(__dirname, '../..', doc.file);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
            }
        }

        const objectId = new mongoose.Types.ObjectId(id);
        await CMSData.updateOne(
            {},
            { $pull: { 'sustainabilityPage.documents': { _id: objectId } } },
            { runValidators: false }
        );

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
});

module.exports = router;

