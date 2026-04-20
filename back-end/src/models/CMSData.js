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
    },
    // Sustainability Page Content (maps to both the
    // "Sustainability Policy & Commitment" and "Sustainability Alternative
    // Proposal" documents)
    sustainabilityPage: {
        hero: {
            title: { type: String, default: 'Sustainability Policy & Commitment' },
            subtitle: { type: String, default: 'Delivering engineering and building services in a responsible, compliant, and sustainable manner.' },
            badge: { type: String, default: 'ISO 14001 Certified' }
        },
        commitment: {
            title: { type: String, default: 'Our Commitment' },
            paragraphs: {
                type: [String],
                default: [
                    'Promach Pte. Ltd. is committed to delivering engineering and building services solutions in a responsible and sustainable manner. We support our clients\u2019 sustainability objectives by integrating energy efficiency, environmental compliance, and resource optimization into our operations and project execution.',
                    'Our approach is aligned with applicable Singapore regulations, industry best practices, and continuous improvement principles, while ensuring that sustainability measures remain practical, safe, and technically suitable for each project.'
                ]
            }
        },
        framework: {
            title: { type: String, default: 'Sustainability Framework' },
            intro: { type: String, default: 'Our sustainability practices are guided by structured management systems and operational controls that support consistent environmental performance.' },
            outro: { type: String, default: 'These frameworks support our commitment towards compliance, waste reduction, efficient resource usage, and continual improvement.' },
            standards: [{
                code: String,
                name: String,
                description: String,
                isActive: { type: Boolean, default: true },
                order: { type: Number, default: 0 }
            }]
        },
        focusAreas: {
            title: { type: String, default: 'Key Focus Areas' },
            subtitle: { type: String, default: 'Six pillars that guide how we plan, execute, and improve every project.' },
            items: [{
                title: String,
                description: String,
                icon: String,
                isActive: { type: Boolean, default: true },
                order: { type: Number, default: 0 }
            }]
        },
        targets: {
            title: { type: String, default: 'Our Sustainability Targets' },
            subtitle: { type: String, default: 'We are committed to driving responsible practices that create long-term value for our projects, people, and the environment.' },
            items: [{
                title: String,
                description: String,
                icon: String,
                isActive: { type: Boolean, default: true },
                order: { type: Number, default: 0 }
            }]
        },
        implementation: {
            title: { type: String, default: 'Our Project Implementation Approach' },
            subtitle: { type: String, default: 'Sustainability is incorporated into our project lifecycle through every key stage \u2014 ensuring responsible, efficient, and high-quality outcomes.' },
            steps: [{
                title: String,
                description: String,
                icon: String,
                isActive: { type: Boolean, default: true },
                order: { type: Number, default: 0 }
            }]
        },
        alternatives: {
            title: { type: String, default: 'Sustainable Alternatives We Offer' },
            subtitle: { type: String, default: 'Subject to Client approval, site conditions, and technical suitability, Promach can adopt the following sustainability alternatives.' },
            items: [{
                title: String,
                description: String,
                icon: String,
                isActive: { type: Boolean, default: true },
                order: { type: Number, default: 0 }
            }]
        },
        continuousImprovement: {
            title: { type: String, default: 'Continuous Improvement' },
            paragraphs: {
                type: [String],
                default: [
                    'Promach remains committed to continuously improving our sustainability practices in line with evolving regulatory requirements, industry standards, and client expectations.',
                    'We will continue to strengthen our processes, awareness, and implementation practices to support responsible and sustainable project delivery.'
                ]
            }
        },
        disclaimer: {
            type: String,
            default: 'All sustainability initiatives described herein are implemented on a best-effort basis and are subject to project specifications, site conditions, technical feasibility, applicable approvals, and Client requirements. Promach Pte. Ltd. shall not be held liable for any design changes, performance variations, or cost implications arising from the adoption of sustainability alternatives beyond the agreed contractual scope.'
        },
        documents: [{
            name: String,
            description: String,
            file: String,
            isActive: { type: Boolean, default: true },
            order: { type: Number, default: 0 }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('CMSData', cmsSchema);
