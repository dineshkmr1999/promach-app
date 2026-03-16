const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const erpUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Operations_Manager', 'Field_Technician'],
        required: true
    },
    // Link technicians to their assigned van/vehicle
    assignedVan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

erpUserSchema.index({ role: 1, isActive: 1 });
erpUserSchema.index({ assignedVan: 1 });

erpUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

erpUserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

erpUserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('ERPUser', erpUserSchema);
