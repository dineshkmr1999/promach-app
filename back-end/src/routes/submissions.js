const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { verifyToken } = require('./auth');

const nodemailer = require('nodemailer');

// Configure email transporter (lazy initialization)
let transporter;
function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporter;
}

// HTML-escape user input to prevent XSS in emails
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Submit form (public)
router.post('/', async (req, res) => {
    try {
        const submissionData = req.body;

        // Basic server-side validation
        if (!submissionData.name || !submissionData.email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(submissionData.email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Get IP address
        const ipAddress = req.ip;

        const submission = new Submission({
            ...submissionData,
            ipAddress
        });

        await submission.save();

        // Send Auto-reply to Customer
        if (submissionData.email && process.env.EMAIL_USER) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: submissionData.email,
                subject: 'Booking Received - Promach Pte Ltd',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #213c4e;">Thank you for your booking!</h2>
                        <p>Dear ${escapeHtml(submissionData.name)},</p>
                        <p>We have received your booking request for <strong>${escapeHtml(submissionData.serviceType)}</strong>.</p>
                        <p><strong>Tracking ID:</strong> ${submission._id}</p>
                        <p>Our team will review your request and contact you shortly to confirm the appointment.</p>
                        <br>
                        <p>Best regards,</p>
                        <p><strong>Promach Pte Ltd</strong><br>
                        (65) 6829 2136<br>
                        enquiry@promachpl.com</p>
                    </div>
                `
            };

            getTransporter().sendMail(mailOptions).catch(err => console.error('Error sending auto-reply:', err.message));
        }

        // Send Notification to Admin
        if (process.env.EMAIL_USER) {
            const adminMailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject: `New Booking: ${escapeHtml(submissionData.serviceType)} - ${escapeHtml(submissionData.name)}`,
                html: `
                    <h3>New Submission Received</h3>
                    <p><strong>Name:</strong> ${escapeHtml(submissionData.name)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(submissionData.mobile)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(submissionData.email)}</p>
                    <p><strong>Service:</strong> ${escapeHtml(submissionData.serviceType)}</p>
                    <p><strong>Date:</strong> ${escapeHtml(submissionData.preferredDate) || 'Not specified'}</p>
                    <p><strong>Time:</strong> ${escapeHtml(submissionData.timeSlot) || 'Not specified'}</p>
                    <p><strong>Address:</strong> ${escapeHtml(submissionData.address)}</p>
                `
            };
            getTransporter().sendMail(adminMailOptions).catch(err => console.error('Error sending admin notification:', err.message));
        }

        // Don't return the full submission object to the client (contains IP, etc.)
        res.status(201).json({ message: 'Submission received successfully', id: submission._id });
    } catch (error) {
        console.error('Submission error:', error.message);
        res.status(500).json({ message: 'Error submitting form' });
    }
});

// Get all submissions (admin only - PROTECTED)
router.get('/', verifyToken, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;

        const [submissions, total] = await Promise.all([
            Submission.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Submission.countDocuments()
        ]);

        res.json({ submissions, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Error fetching submissions:', error.message);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});

// Update submission status (admin only)
router.patch('/:id', verifyToken, async (req, res) => {
    try {
        const { status, notes } = req.body;

        // Validate status value
        const validStatuses = ['new', 'contacted', 'scheduled', 'confirmed', 'completed', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { status, notes },
            { new: true, runValidators: true }
        );

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Error updating submission:', error.message);
        res.status(500).json({ message: 'Error updating submission' });
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
        console.error('Error deleting submission:', error.message);
        res.status(500).json({ message: 'Error deleting submission' });
    }
});

module.exports = router;
