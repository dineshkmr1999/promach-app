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
    },
    // CRO Settings - Conversion Rate Optimization
    croSettings: {
        // Discount Offer Settings
        discountOffer: {
            isEnabled: { type: Boolean, default: true },
            discountAmount: { type: String, default: '$20' },
            discountText: { type: String, default: '$20 OFF your first service!' },
            expiryHours: { type: Number, default: 24 },
            ctaText: { type: String, default: 'Claim Now' }
        },
        // Urgency Banner Settings
        urgencyBanner: {
            isEnabled: { type: Boolean, default: true },
            message: { type: String, default: 'Limited Time: $20 OFF your first service!' },
            ctaText: { type: String, default: 'Claim Now →' },
            backgroundColor: { type: String, default: 'primary' }
        },
        // Exit Intent Popup Settings
        exitIntentPopup: {
            isEnabled: { type: Boolean, default: true },
            title: { type: String, default: "Wait! Don't Leave Yet" },
            subtitle: { type: String, default: 'Get $20 OFF your first service when you book with us!' },
            discountAmount: { type: String, default: '$20 OFF' },
            ctaText: { type: String, default: 'Claim My $20 Discount' },
            dismissText: { type: String, default: "No thanks, I don't want to save money" }
        },
        // Trust Badges Settings
        trustBadges: {
            yearsExperience: { type: String, default: '13+' },
            happyCustomers: { type: String, default: '5,000+' },
            certifications: { type: String, default: '4x ISO' },
            guarantee: { type: String, default: 'BCA Registered' }
        },
        // Testimonials
        testimonials: [{
            name: String,
            location: String,
            rating: { type: Number, default: 5 },
            text: String,
            serviceType: { type: String, enum: ['aircon', 'renovation'], default: 'aircon' },
            date: String,
            isActive: { type: Boolean, default: true }
        }],
        // Quick Quote Modal Settings
        quickQuoteModal: {
            isEnabled: { type: Boolean, default: true },
            title: { type: String, default: 'Get Your Free Quote' },
            subtitle: { type: String, default: 'Takes less than 60 seconds' }
        },
        // Mobile CTA Bar Settings
        mobileCTABar: {
            isEnabled: { type: Boolean, default: true },
            showCallButton: { type: Boolean, default: true },
            showWhatsAppButton: { type: Boolean, default: true },
            showQuoteButton: { type: Boolean, default: true }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('CMSData', cmsSchema);
