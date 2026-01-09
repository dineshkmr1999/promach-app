const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { verifyToken } = require('./auth');

// Submit form (public)
router.post('/', async (req, res) => {
    try {
        const submissionData = req.body;

        // Get IP address
        let ipAddress = req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.connection.remoteAddress;

        const submission = new Submission({
            ...submissionData,
            ipAddress
        });

        await submission.save();
        res.status(201).json({ message: 'Submission received successfully', submission });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting form', error: error.message });
    }
});

// Get all submissions (public - no authentication required)
router.get('/', async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
});

// Update submission status (admin only)
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const { status, notes } = req.body;
        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { status, notes },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Error updating submission', error: error.message });
    }
});

// Delete submission (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const submission = await Submission.findByIdAndDelete(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting submission', error: error.message });
    }
});

module.exports = router;
