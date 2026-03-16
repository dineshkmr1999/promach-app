const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [100, 'Category name cannot exceed 100 characters'],
        },
        code: {
            type: String,
            required: [true, 'Category code is required'],
            trim: true,
            uppercase: true,
            maxlength: [20, 'Category code cannot exceed 20 characters'],
            match: [/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Unique code
categorySchema.index({ code: 1 }, { unique: true });
// Text search on name
categorySchema.index({ name: 'text' });
// Sort order
categorySchema.index({ sortOrder: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);
