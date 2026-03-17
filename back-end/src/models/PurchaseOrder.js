const mongoose = require('mongoose');

const poLineSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterItem',
        required: true
    },
    quantity: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    unitCost: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    receivedQuantity: {
        type: mongoose.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0')
    }
}, { _id: true });

const purchaseOrderSchema = new mongoose.Schema({
    poNumber: {
        type: String,
        unique: true,
        required: true
    },
    supplier: {
        name: { type: String, required: true, trim: true },
        code: { type: String, trim: true },
        contactPerson: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true }
    },
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'Approved', 'Partially_Received', 'Received', 'Cancelled'],
        default: 'Draft'
    },
    lines: [poLineSchema],
    deliverTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    expectedDeliveryDate: {
        type: Date
    },
    totalAmount: {
        type: mongoose.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0')
    },
    notes: {
        type: String,
        trim: true
    },
    // Link to job ticket if PO is for a specific job
    relatedJobTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobTicket',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ status: 1, createdAt: -1 });
purchaseOrderSchema.index({ createdBy: 1 });
purchaseOrderSchema.index({ 'supplier.name': 1 });

// Recalculate total from lines
purchaseOrderSchema.methods.recalcTotal = function () {
    let total = 0;
    for (const line of this.lines) {
        const qty = parseFloat(line.quantity.toString());
        const cost = parseFloat(line.unitCost.toString());
        total += qty * cost;
    }
    this.totalAmount = mongoose.Types.Decimal128.fromString(total.toFixed(2));
};

purchaseOrderSchema.set('toJSON', {
    transform: function (doc, ret) {
        if (ret.totalAmount) ret.totalAmount = parseFloat(ret.totalAmount.toString());
        if (ret.lines) {
            ret.lines = ret.lines.map(l => ({
                ...l,
                quantity: parseFloat(l.quantity.toString()),
                unitCost: parseFloat(l.unitCost.toString()),
                receivedQuantity: l.receivedQuantity ? parseFloat(l.receivedQuantity.toString()) : 0
            }));
        }
        return ret;
    }
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
