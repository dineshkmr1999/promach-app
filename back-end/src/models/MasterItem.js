const mongoose = require('mongoose');

// Sub-schema for kit components
const kitComponentSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterItem',
        required: true
    },
    quantity: {
        type: mongoose.Types.Decimal128,
        required: true
    }
}, { _id: false });

const masterItemSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    itemType: {
        type: String,
        enum: ['Consumable', 'Asset', 'Kit'],
        required: true
    },
    category: {
        type: String,
        trim: true
    },

    // ── Unit of Measure ──
    uom: {
        type: String,
        required: true,
        trim: true
        // e.g. "Liters", "Meters", "Units", "Kg", "Rolls"
    },

    // ── Financial (Decimal128 for SGD precision) ──
    unitCost: {
        type: mongoose.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0')
    },
    sellingPrice: {
        type: mongoose.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0')
    },

    // ── Consumable-specific ──
    reorderLevel: {
        type: mongoose.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0')
    },

    // ── Asset/Tool-specific ──
    assetTag: {
        type: String,
        trim: true,
        sparse: true
    },
    assetStatus: {
        type: String,
        enum: ['available', 'in_use', 'maintenance', 'retired'],
        default: 'available'
    },
    // Who currently holds the asset
    currentHolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser',
        default: null
    },
    currentLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },

    // ── Kit/Bundle-specific ──
    kitComponents: [kitComponentSchema],

    // ── General ──
    brand: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Convert Decimal128 to string for JSON responses
masterItemSchema.set('toJSON', {
    transform: function (doc, ret) {
        if (ret.unitCost) ret.unitCost = parseFloat(ret.unitCost.toString());
        if (ret.sellingPrice) ret.sellingPrice = parseFloat(ret.sellingPrice.toString());
        if (ret.reorderLevel) ret.reorderLevel = parseFloat(ret.reorderLevel.toString());
        if (ret.kitComponents) {
            ret.kitComponents = ret.kitComponents.map(kc => ({
                ...kc,
                quantity: parseFloat(kc.quantity.toString())
            }));
        }
        return ret;
    }
});

masterItemSchema.index({ sku: 1 });
masterItemSchema.index({ itemType: 1, isActive: 1 });
masterItemSchema.index({ name: 'text', sku: 'text' });
masterItemSchema.index({ assetTag: 1 }, { sparse: true });

module.exports = mongoose.model('MasterItem', masterItemSchema);
