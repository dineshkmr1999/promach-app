/**
 * Seed script to populate the Sustainability page CMS data
 * Content sourced from:
 *   - Sustainability Policy & Commitment document
 *   - Sustainability Alternative Proposal document
 *
 * Usage: cd back-end && node seeds/seed-sustainability.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CMSData = require('../src/models/CMSData');

const SUSTAINABILITY_DATA = {
    hero: {
        title: 'Sustainability Policy & Commitment',
        subtitle: 'Promach Pte. Ltd. is committed to delivering engineering and building services solutions in a responsible and sustainable manner — integrating energy efficiency, environmental compliance, and resource optimization into every project.',
        badge: 'ISO 14001 Certified'
    },

    commitment: {
        title: 'Our Commitment',
        paragraphs: [
            'Promach Pte. Ltd. is committed to delivering engineering and building services solutions in a responsible and sustainable manner. We support our clients\u2019 sustainability objectives by integrating energy efficiency, environmental compliance, and resource optimization into our operations and project execution.',
            'Our approach is aligned with applicable Singapore regulations, industry best practices, and continuous improvement principles, while ensuring that sustainability measures remain practical, safe, and technically suitable for each project.'
        ]
    },

    framework: {
        title: 'Sustainability Framework',
        intro: 'Our sustainability practices are guided by structured management systems and operational controls that support consistent environmental performance. Promach operates under the following certified frameworks:',
        outro: 'These frameworks support our commitment towards compliance, waste reduction, efficient resource usage, and continual improvement.',
        standards: [
            {
                code: 'ISO 14001',
                name: 'Environmental Management System',
                description: 'Structured controls for environmental performance and compliance, ensuring continual improvement in our environmental impact across all projects.',
                isActive: true,
                order: 0
            },
            {
                code: 'ISO 9001',
                name: 'Quality Management System',
                description: 'Consistent quality across every project we deliver, with systematic processes that ensure reliability and client satisfaction.',
                isActive: true,
                order: 1
            },
            {
                code: 'ISO 45001',
                name: 'Occupational Health & Safety Management System',
                description: 'Safe operations that protect our workforce and partners, with proactive risk management and continuous safety improvement.',
                isActive: true,
                order: 2
            },
            {
                code: 'ISO 37001',
                name: 'Anti-Bribery Management System',
                description: 'Certified anti-bribery management system ensuring ethical business practices and transparency in all operations.',
                isActive: true,
                order: 3
            },
            {
                code: 'BizSAFE STAR',
                name: 'Workplace Safety & Health Council Recognition',
                description: 'Highest tier of BizSAFE recognition in Singapore, demonstrating our commitment to workplace safety and health excellence.',
                isActive: true,
                order: 4
            }
        ]
    },

    focusAreas: {
        title: 'Key Focus Areas',
        subtitle: 'Six pillars that guide how we plan, execute, and improve every project — ensuring environmental responsibility at every stage.',
        items: [
            {
                title: 'Energy Efficiency',
                description: 'Promach promotes the use of energy-efficient ACMV and mechanical systems where applicable. Proper installation, testing, commissioning, and maintenance practices are implemented to improve system performance and reduce unnecessary energy consumption.',
                icon: 'Zap',
                isActive: true,
                order: 0
            },
            {
                title: 'Environmental Protection',
                description: 'We support environmentally responsible solutions, including the use of compliant refrigerants with lower Global Warming Potential (GWP), where technically feasible and aligned with project requirements.',
                icon: 'Globe',
                isActive: true,
                order: 1
            },
            {
                title: 'Waste Management & Recycling',
                description: 'Promach adopts proper segregation, recycling, and disposal practices for replaced or removed materials through licensed waste contractors, in accordance with regulatory requirements.',
                icon: 'Recycle',
                isActive: true,
                order: 2
            },
            {
                title: 'Resource Optimization',
                description: 'We reduce material wastage through careful planning, proper quantity control, and reuse of existing serviceable materials where safe and feasible.',
                icon: 'Package',
                isActive: true,
                order: 3
            },
            {
                title: 'Lifecycle & Durability',
                description: 'Promach emphasizes the selection of durable and corrosion-resistant materials to extend equipment lifespan, reduce replacement frequency, and lower long-term environmental impact.',
                icon: 'Shield',
                isActive: true,
                order: 4
            },
            {
                title: 'Digitalization',
                description: 'Promach adopts digital documentation and electronic submission systems to enhance operational efficiency and reduce paper consumption. Through the use of digital platforms, system monitoring dashboards, and data-driven reporting tools, we are able to improve workflow transparency, streamline communication, and support more efficient project management and maintenance operations. Digitalization also enables better tracking of system performance, timely reporting, and improved decision-making, contributing to overall efficiency and sustainability in project execution.',
                icon: 'Monitor',
                isActive: true,
                order: 5
            }
        ]
    },

    targets: {
        title: 'Our Sustainability Targets',
        subtitle: 'We are committed to driving responsible practices that create long-term value for our projects, people, and the environment.',
        items: [
            {
                title: 'Waste Reduction',
                description: 'Reduce material wastage through improved planning and reuse practices.',
                icon: 'Recycle',
                isActive: true,
                order: 0
            },
            {
                title: 'Energy Efficiency',
                description: 'Promote energy-efficient systems where technically feasible.',
                icon: 'Zap',
                isActive: true,
                order: 1
            },
            {
                title: 'Recycling',
                description: 'Ensure proper disposal of waste materials through licensed contractors.',
                icon: 'Trash2',
                isActive: true,
                order: 2
            },
            {
                title: 'Compliance',
                description: 'Maintain full compliance with environmental regulations and industry standards.',
                icon: 'ShieldCheck',
                isActive: true,
                order: 3
            },
            {
                title: 'Continuous Improvement',
                description: 'Continuously improve environmental performance under our ISO 14001 framework.',
                icon: 'TrendingUp',
                isActive: true,
                order: 4
            },
            {
                title: 'Preventive Maintenance',
                description: 'Enhance preventive maintenance practices to improve system efficiency and lifespan.',
                icon: 'Wrench',
                isActive: true,
                order: 5
            }
        ]
    },

    implementation: {
        title: 'Our Project Implementation Approach',
        subtitle: 'Sustainability is incorporated into our project lifecycle through every key stage — ensuring responsible, efficient, and high-quality outcomes.',
        steps: [
            {
                title: 'Planning',
                description: 'Efficient planning and coordination to reduce abortive works and improve resource utilization.',
                icon: 'ClipboardList',
                isActive: true,
                order: 0
            },
            {
                title: 'Procurement',
                description: 'Responsible sourcing and optimized logistics to minimize unnecessary transport movements.',
                icon: 'ShoppingCart',
                isActive: true,
                order: 1
            },
            {
                title: 'Installation',
                description: 'Proper installation and commissioning practices to ensure system efficiency and reliability.',
                icon: 'HardHat',
                isActive: true,
                order: 2
            },
            {
                title: 'Waste Handling',
                description: 'Responsible handling, segregation, and disposal of removed and replaced materials through licensed contractors.',
                icon: 'Recycle',
                isActive: true,
                order: 3
            },
            {
                title: 'Testing & Commissioning',
                description: 'Rigorous testing and commissioning to verify system performance and ensure compliance.',
                icon: 'CheckCircle',
                isActive: true,
                order: 4
            },
            {
                title: 'Maintenance',
                description: 'Preventive maintenance to improve performance, extend service life, and reduce long-term environmental impact.',
                icon: 'Wrench',
                isActive: true,
                order: 5
            }
        ]
    },

    alternatives: {
        title: 'Sustainable Alternatives We Offer',
        subtitle: 'Promach Pte. Ltd. supports Singtel\u2019s sustainability objectives by adopting practical, efficient, and environmentally responsible approaches in our project execution. The following sustainable alternatives can be considered, subject to Client approval, site conditions, and technical suitability:',
        items: [
            {
                title: 'Energy Efficiency Enhancement',
                description: 'Adoption of energy-efficient equipment and systems where applicable, with optimization of installation and commissioning practices to ensure efficient operation, reduced energy consumption, and improved system performance.',
                icon: 'Zap',
                isActive: true,
                order: 0
            },
            {
                title: 'Environmentally Responsible Refrigerants',
                description: 'Preference for systems utilizing low Global Warming Potential (GWP) refrigerants, where compliant with NEA regulations and aligned with project specifications.',
                icon: 'Snowflake',
                isActive: true,
                order: 1
            },
            {
                title: 'Material Optimization and Reuse',
                description: 'Reuse of existing serviceable materials such as supports, containment, and piping routes where feasible, to minimize material wastage and reduce environmental impact.',
                icon: 'Layers',
                isActive: true,
                order: 2
            },
            {
                title: 'Waste Management and Recycling',
                description: 'Proper segregation, recycling, and disposal of replaced materials through licensed waste contractors, in accordance with environmental regulations and best practices.',
                icon: 'Recycle',
                isActive: true,
                order: 3
            },
            {
                title: 'Durable Material Selection',
                description: 'Use of corrosion-resistant and durable materials to extend equipment lifespan, thereby reducing replacement frequency and long-term environmental impact.',
                icon: 'Shield',
                isActive: true,
                order: 4
            },
            {
                title: 'Resource and Logistics Efficiency',
                description: 'Careful planning of materials and work sequences to minimize over-ordering, abortive works, and unnecessary transportation, contributing to reduced carbon footprint.',
                icon: 'Truck',
                isActive: true,
                order: 5
            },
            {
                title: 'Digital Documentation',
                description: 'Adoption of digital submissions, reports, and documentation where possible to reduce paper consumption and improve efficiency.',
                icon: 'Monitor',
                isActive: true,
                order: 6
            },
            {
                title: 'Preventive Maintenance Approach',
                description: 'Implementation of effective maintenance strategies to enhance system efficiency, reduce operational losses, and prolong asset life.',
                icon: 'Wrench',
                isActive: true,
                order: 7
            }
        ]
    },

    continuousImprovement: {
        title: 'Continuous Improvement',
        paragraphs: [
            'Promach remains committed to continuously improving our sustainability practices in line with evolving regulatory requirements, industry standards, and client expectations.',
            'We will continue to strengthen our processes, awareness, and implementation practices to support responsible and sustainable project delivery.'
        ]
    },

    disclaimer: 'All sustainability initiatives described herein are implemented on a best-effort basis and are subject to project specifications, site conditions, technical feasibility, applicable approvals, and Client requirements. Promach Pte. Ltd. shall not be held liable for any design changes, performance variations, or cost implications arising from the adoption of sustainability alternatives beyond the agreed contractual scope. All proposed alternatives are indicative and shall be subject to Client approval, consultant requirements, and project specifications.',

    documents: []
};

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let cms = await CMSData.findOne();
        if (!cms) {
            cms = new CMSData();
            console.log('Created new CMSData document');
        }

        // Force-replace the sustainability page content
        cms.sustainabilityPage = SUSTAINABILITY_DATA;
        cms.markModified('sustainabilityPage');
        await cms.save();

        console.log('\nSustainability page seeded successfully!');
        console.log('Summary:');
        console.log(`  Hero: "${SUSTAINABILITY_DATA.hero.title}"`);
        console.log(`  Commitment: ${SUSTAINABILITY_DATA.commitment.paragraphs.length} paragraphs`);
        console.log(`  Framework standards: ${SUSTAINABILITY_DATA.framework.standards.length} (incl. ISO 37001)`);
        console.log(`  Focus areas: ${SUSTAINABILITY_DATA.focusAreas.items.length}`);
        console.log(`  Targets: ${SUSTAINABILITY_DATA.targets.items.length}`);
        console.log(`  Implementation steps: ${SUSTAINABILITY_DATA.implementation.steps.length}`);
        console.log(`  Alternatives: ${SUSTAINABILITY_DATA.alternatives.items.length}`);
        console.log(`  Continuous improvement: ${SUSTAINABILITY_DATA.continuousImprovement.paragraphs.length} paragraphs`);
        console.log(`  Disclaimer: ${SUSTAINABILITY_DATA.disclaimer.length} chars`);

    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

seed();
