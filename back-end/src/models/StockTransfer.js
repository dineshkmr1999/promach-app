const mongoose = require('mongoose');

const stockTransferSchema = new mongoose.Schema({
    transferNumber: {
        type: String,
        unique: true,
        required: true
    },
    fromLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    toLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MasterItem',
            required: true
        },
        quantity: {
            type: mongoose.Types.Decimal128,
            required: true
        }
    }],
    status: {
        type: String,
        enum: ['Pending', 'In_Transit', 'Received', 'Cancelled'],
        default: 'Pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser',
        required: true
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser',
        default: null
    },
    receivedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

stockTransferSchema.index({ status: 1 });
stockTransferSchema.index({ fromLocation: 1, toLocation: 1 });

stockTransferSchema.set('toJSON', {
    transform: function (doc, ret) {
        if (ret.items) {
            ret.items = ret.items.map(i => ({
                ...i,
                quantity: parseFloat(i.quantity.toString())
            }));
        }
        return ret;
    }
});

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
