const mongoose = require('mongoose');

const inventoryTxnSchema = new mongoose.Schema({
    txnType: {
        type: String,
        enum: [
            'Receive',          // Goods received into warehouse
            'Transfer_Out',     // Stock leaves a location (van restock, etc.)
            'Transfer_In',      // Stock arrives at destination
            'Consume',          // Material used on a job
            'Adjust',           // Manual stock adjustment
            'Asset_CheckOut',   // Tool checked out to technician
            'Asset_CheckIn',    // Tool returned
            'Kit_Expand'        // Kit broken into components
        ],
        required: true
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterItem',
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },
    quantity: {
        type: mongoose.Types.Decimal128,
        required: true
        // Positive for inbound, negative for outbound
    },
    // Link to transfer or job if applicable
    relatedTransfer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockTransfer',
        default: null
    },
    relatedJobTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobTicket',
        default: null
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser',
        required: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

inventoryTxnSchema.index({ item: 1, location: 1, createdAt: -1 });
inventoryTxnSchema.index({ relatedJobTicket: 1 });
inventoryTxnSchema.index({ relatedTransfer: 1 });
inventoryTxnSchema.index({ txnType: 1, createdAt: -1 });

inventoryTxnSchema.set('toJSON', {
    transform: function (doc, ret) {
        if (ret.quantity) ret.quantity = parseFloat(ret.quantity.toString());
        return ret;
    }
});

module.exports = mongoose.model('InventoryTransaction', inventoryTxnSchema);
