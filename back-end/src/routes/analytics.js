const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const { verifyToken } = require('./auth');

// Track page view (public, no sensitive data returned)
router.post('/track', async (req, res) => {
    try {
        const { path, referrer, userAgent } = req.body;

        if (!path || typeof path !== 'string') {
            return res.status(400).json({ success: false });
        }

        // Sanitize path to prevent storing malicious data
        const sanitizedPath = path.substring(0, 500);

        // Use req.ip which respects trust proxy setting
        let ipAddress = req.ip;

        // Skip localhost IPs
        const localhostPatterns = ['127.0.0.1', '::1', 'localhost', '::ffff:127'];
        if (localhostPatterns.some(pattern => ipAddress?.includes(pattern))) {
            ipAddress = null;
        }

        // Skip localhost referrers
        let cleanReferrer = null;
        if (referrer) {
            try {
                const referrerUrl = new URL(referrer);
                const skipReferrers = ['localhost', '127.0.0.1', '::1'];
                if (!skipReferrers.some(skip => referrerUrl.hostname.includes(skip))) {
                    cleanReferrer = referrer.substring(0, 2000);
                }
            } catch {
                // Invalid URL, skip referrer
            }
        }

        const analytics = new Analytics({
            path: sanitizedPath,
            ipAddress,
            referrer: cleanReferrer,
            userAgent: userAgent ? userAgent.substring(0, 500) : undefined
        });

        await analytics.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Analytics tracking error:', error.message);
        res.status(500).json({ success: false });
    }
});

// Get analytics overview (admin only)
router.get('/overview', verifyToken, async (req, res) => {
    try {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [totalVisits, uniqueVisitors, topPages, topReferrers] = await Promise.all([
            // Total visits (last 30 days, excluding localhost)
            Analytics.countDocuments({
                timestamp: { $gte: last30Days },
                ipAddress: { $ne: null }
            }),

            // Unique visitors
            Analytics.distinct('ipAddress', {
                timestamp: { $gte: last30Days },
                ipAddress: { $ne: null }
            }),

            // Top pages
            Analytics.aggregate([
                { $match: { timestamp: { $gte: last30Days }, ipAddress: { $ne: null } } },
                { $group: { _id: '$path', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // Top referrers (excluding localhost)
            Analytics.aggregate([
                {
                    $match: {
                        timestamp: { $gte: last30Days },
                        ipAddress: { $ne: null },
                        referrer: {
                            $nin: [null, ''],
                            $not: /localhost/
                        }
                    }
                },
                { $group: { _id: '$referrer', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        res.json({
            totalVisits,
            uniqueVisitors: uniqueVisitors.length,
            topPages,
            topReferrers
        });
    } catch (error) {
        console.error('Error fetching analytics:', error.message);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

module.exports = router;
