const mongoose = require('mongoose');

// Materials consumed / assets used on a specific job
const costLineSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterItem',
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    quantity: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    unitCost: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    totalCost: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    consumedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    loggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser'
    },
    loggedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const jobTicketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },
    jobType: {
        type: String,
        enum: ['Aircon_Service', 'Aircon_Install', 'Aircon_Repair', 'Renovation', 'Maintenance_Contract', 'Other'],
        required: true
    },

    // ── Customer ──
    customer: {
        name: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        company: { type: String, trim: true }
    },
    siteAddress: {
        street: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        unit: { type: String, trim: true },
        building: { type: String, trim: true }
    },

    // ── Scheduling ──
    scheduledDate: {
        type: Date,
        required: true
    },
    scheduledTimeSlot: {
        type: String,
        trim: true
        // e.g. "09:00-12:00"
    },
    completedAt: {
        type: Date
    },

    // ── Assignment ──
    assignedTechnicians: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser'
    }],

    // ── Status ──
    status: {
        type: String,
        enum: ['Draft', 'Scheduled', 'In_Progress', 'On_Hold', 'Completed', 'Invoiced', 'Cancelled'],
        default: 'Draft'
    },
    priority: {
        type: String,
        enum: ['Low', 'Normal', 'High', 'Urgent'],
        default: 'Normal'
    },

    // ── Financials (SGD Decimal128) ──
    quotedPrice: {
        type: mongoose.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0')
    },
    // Cost lines: real materials/assets used
    costLines: [costLineSchema],

    // Computed fields stored for query performance
    totalMaterialCost: {
        type: mongoose.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0')
    },
    grossProfit: {
        type: mongoose.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0')
    },

    // ── Notes ──
    internalNotes: {
        type: String,
        trim: true
    },
    customerRemarks: {
        type: String,
        trim: true
    },

    // ── Linked Submission (from CMS booking form) ──
    linkedSubmission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        default: null
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser'
    }
}, {
    timestamps: true
});

// Recalculate total material cost and gross profit
jobTicketSchema.methods.recalcCosts = function () {
    let total = 0;
    for (const line of this.costLines) {
        total += parseFloat(line.totalCost.toString());
    }
    this.totalMaterialCost = mongoose.Types.Decimal128.fromString(total.toFixed(2));
    const quoted = parseFloat(this.quotedPrice.toString());
    this.grossProfit = mongoose.Types.Decimal128.fromString((quoted - total).toFixed(2));
};

jobTicketSchema.index({ ticketNumber: 1 });
jobTicketSchema.index({ status: 1, scheduledDate: 1 });
jobTicketSchema.index({ assignedTechnicians: 1 });
jobTicketSchema.index({ 'customer.name': 'text', ticketNumber: 'text' });

jobTicketSchema.set('toJSON', {
    transform: function (doc, ret) {
        const dec = ['quotedPrice', 'totalMaterialCost', 'grossProfit'];
        dec.forEach(f => {
            if (ret[f]) ret[f] = parseFloat(ret[f].toString());
        });
        if (ret.costLines) {
            ret.costLines = ret.costLines.map(cl => ({
                ...cl,
                quantity: cl.quantity ? parseFloat(cl.quantity.toString()) : 0,
                unitCost: cl.unitCost ? parseFloat(cl.unitCost.toString()) : 0,
                totalCost: cl.totalCost ? parseFloat(cl.totalCost.toString()) : 0
            }));
        }
        return ret;
    }
});

module.exports = mongoose.model('JobTicket', jobTicketSchema);
