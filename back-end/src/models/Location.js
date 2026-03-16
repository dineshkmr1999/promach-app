const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    locationType: {
        type: String,
        enum: ['Warehouse', 'Van', 'Site'],
        required: true
    },
    // Hierarchical parent for sub-locations (e.g. Shelf A in Main Warehouse)
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },
    address: {
        type: String,
        trim: true
    },
    // Van: which technician(s) are assigned
    assignedTechnicians: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ERPUser'
    }],
    // Van: vehicle registration number
    vehicleNumber: {
        type: String,
        trim: true
    },
    // Site: link to a job ticket for renovation direct-to-site deliveries
    linkedJobTicket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobTicket',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

locationSchema.index({ locationType: 1, isActive: 1 });
locationSchema.index({ parent: 1 });

module.exports = mongoose.model('Location', locationSchema);
