const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    path: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
    referrer: String,
    timestamp: { type: Date, default: Date.now },
    device: String,
    browser: String,
    os: String,
    country: String,
    city: String
}, { timestamps: true });

// Indexes for faster queries
analyticsSchema.index({ path: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
