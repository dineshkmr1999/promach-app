const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Portfolio = require('../models/Portfolio');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/portfolio/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Helper function to map uploaded files to proper format
const mapFiles = (files) => {
    if (!files || files.length === 0) return [];
    return files.map(file => ({
        url: `/uploads/portfolio/${file.filename}`,
        filename: file.filename,
        caption: ''
    }));
};

// GET all portfolio items with optional filtering
router.get('/', async (req, res) => {
    try {
        const { category, isFeatured, limit } = req.query;

        let query = { isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (isFeatured === 'true') {
            query.isFeatured = true;
        }

        let portfolioQuery = Portfolio.find(query).sort({ completedAt: -1, createdAt: -1 });

        if (limit) {
            portfolioQuery = portfolioQuery.limit(parseInt(limit));
        }

        const items = await portfolioQuery;
        res.json(items);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ message: 'Error fetching portfolio items', error: error.message });
    }
});

// GET single portfolio item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Portfolio.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error fetching portfolio item:', error);
        res.status(500).json({ message: 'Error fetching portfolio item', error: error.message });
    }
});

// POST create new portfolio item (with multiple file types)
router.post('/', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'beforeImages', maxCount: 5 },
    { name: 'afterImages', maxCount: 5 }
]), async (req, res) => {
    try {
        const { title, description, category, tags, location, isFeatured, completedAt } = req.body;

        // Process uploaded files
        const images = mapFiles(req.files?.images || []);
        const beforeImages = mapFiles(req.files?.beforeImages || []);
        const afterImages = mapFiles(req.files?.afterImages || []);

        const portfolioItem = new Portfolio({
            title,
            description,
            category,
            tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
            images,
            beforeImages,
            afterImages,
            location,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            completedAt: completedAt || new Date(),
            isActive: true
        });

        await portfolioItem.save();
        res.status(201).json(portfolioItem);
    } catch (error) {
        console.error('Error creating portfolio item:', error);
        res.status(500).json({ message: 'Error creating portfolio item', error: error.message });
    }
});

// PUT update portfolio item (with multiple file types)
router.put('/:id', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'beforeImages', maxCount: 5 },
    { name: 'afterImages', maxCount: 5 }
]), async (req, res) => {
    try {
        const { title, description, category, tags, location, isFeatured, completedAt, existingImages, existingBeforeImages, existingAfterImages } = req.body;

        const item = await Portfolio.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        // Parse existing images from request
        const parsedExistingImages = existingImages ? JSON.parse(existingImages) : [];
        const parsedExistingBeforeImages = existingBeforeImages ? JSON.parse(existingBeforeImages) : [];
        const parsedExistingAfterImages = existingAfterImages ? JSON.parse(existingAfterImages) : [];

        // Merge existing images with newly uploaded ones
        const newImages = mapFiles(req.files?.images || []);
        const newBeforeImages = mapFiles(req.files?.beforeImages || []);
        const newAfterImages = mapFiles(req.files?.afterImages || []);

        // Update fields
        item.title = title || item.title;
        item.description = description || item.description;
        item.category = category || item.category;
        item.tags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : item.tags;
        item.images = [...parsedExistingImages, ...newImages];
        item.beforeImages = [...parsedExistingBeforeImages, ...newBeforeImages];
        item.afterImages = [...parsedExistingAfterImages, ...newAfterImages];
        item.location = location || item.location;
        item.isFeatured = isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : item.isFeatured;
        item.completedAt = completedAt || item.completedAt;

        await item.save();
        res.json(item);
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(500).json({ message: 'Error updating portfolio item', error: error.message });
    }
});

// DELETE portfolio item (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const item = await Portfolio.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        item.isActive = false;
        await item.save();

        res.json({ message: 'Portfolio item deleted successfully' });
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        res.status(500).json({ message: 'Error deleting portfolio item', error: error.message });
    }
});

module.exports = router;
