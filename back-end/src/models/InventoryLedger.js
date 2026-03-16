const mongoose = require('mongoose');

const inventoryLedgerSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterItem',
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    quantityOnHand: {
        type: mongoose.Types.Decimal128,
        required: true,
        default: mongoose.Types.Decimal128.fromString('0')
    }
}, {
    timestamps: true
});

// One row per item per location — enforced unique compound index
inventoryLedgerSchema.index({ item: 1, location: 1 }, { unique: true });
inventoryLedgerSchema.index({ location: 1 });

inventoryLedgerSchema.set('toJSON', {
    transform: function (doc, ret) {
        if (ret.quantityOnHand) ret.quantityOnHand = parseFloat(ret.quantityOnHand.toString());
        return ret;
    }
});

module.exports = mongoose.model('InventoryLedger', inventoryLedgerSchema);
