const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { verifyToken } = require('./auth');

const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

        // Send Auto-reply to Customer
        if (submissionData.email) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: submissionData.email,
                subject: 'Booking Received - Promach Pte Ltd',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #213c4e;">Thank you for your booking!</h2>
                        <p>Dear ${submissionData.name},</p>
                        <p>We have received your booking request for <strong>${submissionData.serviceType}</strong>.</p>
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

            // Send async, don't block response
            transporter.sendMail(mailOptions).catch(err => console.error('Error sending auto-reply:', err));
        }

        // Send Notification to Admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: `New Booking: ${submissionData.serviceType} - ${submissionData.name}`,
            html: `
                <h3>New Submission Received</h3>
                <p><strong>Name:</strong> ${submissionData.name}</p>
                <p><strong>Phone:</strong> ${submissionData.mobile}</p>
                <p><strong>Email:</strong> ${submissionData.email}</p>
                <p><strong>Service:</strong> ${submissionData.serviceType}</p>
                <p><strong>Date:</strong> ${submissionData.preferredDate || 'Not specified'}</p>
                <p><strong>Time:</strong> ${submissionData.timeSlot || 'Not specified'}</p>
                <p><strong>Address:</strong> ${submissionData.address}</p>
            `
        };
        transporter.sendMail(adminMailOptions).catch(err => console.error('Error sending admin notification:', err));

        res.status(201).json({ message: 'Submission received successfully', submission });
    } catch (error) {
        console.error('Submission error:', error);
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
