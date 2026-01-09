const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
    pricingTables: [{
        tableId: String,
        title: String,
        description: String,
        headers: [String],
        data: [mongoose.Schema.Types.Mixed],  // Array of objects like {units: "1", price: "$43.60"}
        scopeOfJob: [String],
        duration: String,
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 }
    }],
    additionalServices: {
        condenserCleaning: {
            normal: String,
            dry: String,
            steam: String
        },
        gasTopUp: {
            r22: String,
            r410a: String,
            r32: String
        },
        troubleshooting: String
    },
    brands: [String],
    brandsWithLogos: [{
        name: String,
        logo: String,
        isActive: Boolean,
        order: Number
    }],
    certificates: [{
        name: String,
        icon: String,
        file: String,
        description: String
    }],
    seo: {
        home: {
            title: String,
            description: String,
            keywords: [String]
        },
        services: {
            title: String,
            description: String,
            keywords: [String]
        },
        about: {
            title: String,
            description: String,
            keywords: [String]
        },
        contact: {
            title: String,
            description: String,
            keywords: [String]
        }
    },
    companyInfo: {
        name: String,
        shortName: String,
        tagline: String,
        phone: String,
        email: String,
        whatsapp: String,
        address: {
            street: String,
            building: String,
            city: String,
            postalCode: String,
            country: String
        },
        businessHours: {
            weekdays: String,
            saturday: String,
            sunday: String
        },
        social: {
            facebook: String,
            instagram: String,
            linkedin: String,
            youtube: String
        },
        analytics: {
            googleAnalyticsId: String,
            googleTagManagerId: String,
            facebookPixelId: String
        }
    },
    socialMedia: {
        facebook: String,
        instagram: String,
        linkedin: String,
        youtube: String
    },
    aboutPage: {
        heroTitle: String,
        heroSubtitle: String,
        missionTitle: String,
        missionText: String,
        visionTitle: String,
        visionText: String,
        historyText: String
    },
    contactPage: {
        heroTitle: String,
        heroSubtitle: String,
        formTitle: String,
        formDescription: String,
        mapEmbedUrl: String,
        additionalInfo: String
    },
    bcaRegistrations: {
        sectionTitle: { type: String, default: 'BCA Registrations' },
        companyName: String,
        uen: String,
        bcaUrl: String,
        registeredContractors: [{
            workhead: String,
            description: String,
            grade: String,
            expiryDate: String,
            isActive: { type: Boolean, default: true }
        }],
        licensedBuilders: [{
            licensingCode: String,
            description: String,
            expiryDate: String,
            isActive: { type: Boolean, default: true }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('CMSData', cmsSchema);
