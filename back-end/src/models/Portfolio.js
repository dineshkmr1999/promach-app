const mongoose = require('mongoose');

const portfolioImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    filename: { type: String, required: true },
    caption: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
}, { _id: true });

const portfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['aircon', 'renovation', 'maintenance', 'installation']
    },
    tags: [{
        type: String,
        trim: true
    }],
    images: [portfolioImageSchema],
    beforeImages: [portfolioImageSchema],
    afterImages: [portfolioImageSchema],
    location: {
        type: String,
        trim: true
    },
    clientName: {
        type: String,
        trim: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Index for faster queries
portfolioSchema.index({ category: 1, isFeatured: 1, completedAt: -1 });
portfolioSchema.index({ isActive: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
