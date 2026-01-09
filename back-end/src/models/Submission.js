const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['booking', 'contact'],
        default: 'booking'
    },
    formType: String, // Alternative field name for type
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    mobile: String, // Singapore mobile format
    message: String,

    // Booking-specific fields
    existingClient: String,
    address: String,
    postalCode: String,
    serviceType: String,
    propertyType: String,
    numberOfUnits: Number,
    brand: String,
    preferredDate: String, // Changed to String to handle date string from frontend
    timeSlot: String,
    remarks: String,
    pdpaConsent: Boolean,

    // Status and tracking
    status: {
        type: String,
        enum: ['new', 'contacted', 'scheduled', 'confirmed', 'completed', 'cancelled'],
        default: 'new'
    },
    source: String,
    referrer: String,
    ipAddress: String,

    // Admin fields
    adminNotes: String,
    notes: String,
    contactedAt: Date,
    quotedAmount: Number
}, { timestamps: true });

submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ type: 1 });

module.exports = mongoose.model('Submission', submissionSchema);

