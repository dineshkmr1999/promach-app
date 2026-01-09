const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

// Track page view
router.post('/track', async (req, res) => {
    try {
        const { path, referrer, userAgent } = req.body;

        // Get IP address
        let ipAddress = req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.headers['cf-connecting-ip'] ||
            req.connection.remoteAddress;

        // Skip localhost IPs
        const localhostPatterns = ['127.0.0.1', '::1', 'localhost', '::ffff:127'];
        if (localhostPatterns.some(pattern => ipAddress?.includes(pattern))) {
            ipAddress = null;
        }

        // Skip localhost referrers
        const referrerDomain = referrer ? new URL(referrer).hostname : null;
        const skipReferrers = ['localhost', '127.0.0.1', '::1'];
        const shouldSkipReferrer = skipReferrers.some(skip => referrerDomain?.includes(skip));

        const analytics = new Analytics({
            path,
            ipAddress,
            referrer: shouldSkipReferrer ? null : referrer,
            userAgent
        });

        await analytics.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ message: 'Error tracking analytics', error: error.message });
    }
});

// Get analytics overview
router.get('/overview', async (req, res) => {
    try {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Total visits (last 30 days, excluding localhost)
        const totalVisits = await Analytics.countDocuments({
            timestamp: { $gte: last30Days },
            ipAddress: { $ne: null }
        });

        // Unique visitors
        const uniqueVisitors = await Analytics.distinct('ipAddress', {
            timestamp: { $gte: last30Days },
            ipAddress: { $ne: null }
        });

        // Top pages
        const topPages = await Analytics.aggregate([
            { $match: { timestamp: { $gte: last30Days }, ipAddress: { $ne: null } } },
            { $group: { _id: '$path', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Top referrers (excluding localhost)
        const topReferrers = await Analytics.aggregate([
            {
                $match: {
                    timestamp: { $gte: last30Days },
                    ipAddress: { $ne: null },
                    referrer: {
                        $nin: [null, '', 'http://localhost:9003', 'http://localhost:9001', 'http://127.0.0.1:9003'],
                        $not: /localhost/
                    }
                }
            },
            { $group: { _id: '$referrer', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            totalVisits,
            uniqueVisitors: uniqueVisitors.length,
            topPages,
            topReferrers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
});

module.exports = router;
