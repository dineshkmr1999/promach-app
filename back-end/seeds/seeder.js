/**
 * Promach Admin Panel Database Seeder
 * 
 * This script seeds the database with initial data for:
 * - Admin user
 * - CMS data (company info, social media, pricing, brands, certificates)
 * 
 * Run: node seeds/seeder.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const Admin = require('../src/models/Admin');
const CMSData = require('../src/models/CMSData');

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose.connect(mongoUri);
        console.log('📦 MongoDB connected for seeding');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Seed Admin User
const seedAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: 'admin@promach.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new Admin({
            email: 'admin@promach.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'super_admin'
        });

        await admin.save();
        console.log('✅ Admin user created:');
        console.log('   Email: admin@promach.com');
        console.log('   Password: admin123');
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};

// Seed CMS Data
const seedCMSData = async () => {
    try {
        const existingCMS = await CMSData.findOne();

        if (existingCMS) {
            console.log('⚠️  CMS data already exists, skipping seed...');
            console.log('   Delete existing data first if you want to re-seed');
            return;
        }

        const cmsData = new CMSData({
            pricingTables: [
                {
                    _id: new mongoose.Types.ObjectId('6937dd0f2029f02b586588c7'),
                    tableId: 'normal-servicing',
                    title: 'Normal Servicing / Yearly Maintenance',
                    description: '9,000 - 36,000 BTU',
                    headers: ['Fancoil Unit', 'One Time', 'Tri-Yearly (×3)', 'Quarterly (×4)'],
                    data: [
                        { units: '1', oneTime: '$43.60', triYearly: '–', quarterly: '–' },
                        { units: '2', oneTime: '$59.95', triYearly: '$163.50', quarterly: '$207.10' },
                        { units: '3', oneTime: '$76.30', triYearly: '$218.00', quarterly: '$261.60' },
                        { units: '4', oneTime: '$92.65', triYearly: '$250.70', quarterly: '$327.00' },
                        { units: '5', oneTime: '$109.00', triYearly: '$305.20', quarterly: '$381.50' },
                        { units: '6', oneTime: '$124.26', triYearly: '$359.70', quarterly: '$457.80' }
                    ],
                    scopeOfJob: [
                        'Clean & check air filter / panel / cover',
                        'Deodorise & purify filter',
                        'Clean evaporator coil & drain tray',
                        'Vacuum drain line',
                        'Lubricate fan bearing (if needed)',
                        'Check compressor suction & discharge'
                    ],
                    duration: '15–20 min per unit + 20 min travel buffer',
                    isActive: true,
                    order: 0
                },
                {
                    _id: new mongoose.Types.ObjectId('6937dd0f2029f02b586588c8'),
                    tableId: 'chemical-wash',
                    title: 'Chemical Wash',
                    description: '9,000 - 36,000 BTU',
                    headers: ['Units', 'Price'],
                    data: [
                        { units: '1', price: '$92.65' },
                        { units: '2', price: '$174.40' },
                        { units: '3', price: '$250.70' },
                        { units: '4', price: '$316.10' },
                        { units: '5', price: '$381.50' },
                        { units: '6+', price: '$70.85 / FCU' }
                    ],
                    scopeOfJob: [
                        'Chemical cleaning of coil & drain tray',
                        'Vacuum drain system',
                        'Check fan bearing & compressor',
                        'Tighten electrical contacts',
                        'Gas top-up (if required)'
                    ],
                    isActive: true,
                    order: 1
                },
                {
                    _id: new mongoose.Types.ObjectId('6937dd0f2029f02b586588c9'),
                    tableId: 'steam-wash',
                    title: 'Steam Wash',
                    description: '9,000 - 36,000 BTU',
                    headers: ['Units', 'Price'],
                    data: [
                        { units: '1', price: '$92.65' },
                        { units: '2', price: '$174.40' },
                        { units: '3', price: '$250.70' },
                        { units: '4', price: '$316.10' },
                        { units: '5', price: '$381.50' },
                        { units: '6+', price: '$70.85 / FCU' }
                    ],
                    scopeOfJob: [
                        'High-pressure steam coil cleaning',
                        'Drain vacuum & flushing',
                        'Check compressor operation',
                        'Tighten electrical connections'
                    ],
                    isActive: true,
                    order: 2
                },
                {
                    _id: new mongoose.Types.ObjectId('6937dd0f2029f02b586588ca'),
                    tableId: 'chemical-overhaul',
                    title: 'Chemical Overhaul',
                    description: '9,000 - 36,000 BTU',
                    headers: ['Units', 'Price'],
                    data: [
                        { units: '1', price: '$163.50' },
                        { units: '2', price: '$305.20' },
                        { units: '3', price: '$425.10' },
                        { units: '4', price: '$523.20' },
                        { units: '5', price: '$599.50' },
                        { units: '6+', price: '$109.00 / FCU' }
                    ],
                    scopeOfJob: [
                        'Full dismantle & coil chemical soak',
                        'Lubricate fan bearings',
                        'Check thermostats & controls',
                        'Replace worn bearings & eliminate noise'
                    ],
                    isActive: true,
                    order: 3
                }
            ],
            additionalServices: {
                condenserCleaning: {
                    normal: '$54.50',
                    dry: '$87.20–$130.80',
                    steam: '$87.20'
                },
                gasTopUp: {
                    r22: '$43.60–$130.80',
                    r410a: '$65.40–$163.50',
                    r32: '$87.20–$218.00'
                },
                troubleshooting: '$54.50'
            },
            brands: [
                'Daikin', 'Mitsubishi', 'Panasonic', 'LG', 'Samsung',
                'Toshiba', 'Hitachi', 'Fujitsu', 'Carrier', 'York', 'Midea'
            ],
            brandsWithLogos: [
                { _id: new mongoose.Types.ObjectId('6938630f72434fa305fc8d98'), name: 'Daikin', logo: '', isActive: true, order: 0 },
                { _id: new mongoose.Types.ObjectId('6938630f72434fa305fc8d99'), name: 'Mitsubishi Electric', logo: '', isActive: true, order: 1 },
                { _id: new mongoose.Types.ObjectId('6938630f72434fa305fc8d9a'), name: 'Panasonic', logo: '', isActive: true, order: 2 },
                { _id: new mongoose.Types.ObjectId('6938630f72434fa305fc8d9b'), name: 'LG', logo: '', isActive: true, order: 3 },
                { _id: new mongoose.Types.ObjectId('6938630f72434fa305fc8d9c'), name: 'Samsung', logo: '', isActive: true, order: 4 },
                { _id: new mongoose.Types.ObjectId('693867a2264eec7fbda35946'), name: 'Toshiba', logo: '', isActive: true, order: 5 },
                { _id: new mongoose.Types.ObjectId('693868c6264eec7fbda35bd3'), name: 'Hitachi', logo: '', isActive: true, order: 6 },
                { _id: new mongoose.Types.ObjectId('69386927264eec7fbda35cd6'), name: 'Fujitsu', logo: '', isActive: true, order: 7 },
                { _id: new mongoose.Types.ObjectId('6938696d264eec7fbda35dc7'), name: 'Carrier', logo: '', isActive: true, order: 8 },
                { _id: new mongoose.Types.ObjectId('693869dd264eec7fbda35f44'), name: 'York', logo: '', isActive: true, order: 9 },
                { _id: new mongoose.Types.ObjectId('69386a19264eec7fbda3600a'), name: 'Midea', logo: '', isActive: true, order: 10 }
            ],
            certificates: [
                { _id: new mongoose.Types.ObjectId('6937dd0f2029f02b586588ba'), name: 'ISO 9001:2015', description: 'Quality Management System', file: '', icon: '', isActive: true, order: 0 },
                { _id: new mongoose.Types.ObjectId('6937dd0f2029f02b586588bb'), name: 'ISO 14001:2015', description: 'Environmental Management System', file: '', icon: '', isActive: true, order: 1 },
                { _id: new mongoose.Types.ObjectId('6937dd0f2029f02b586588bc'), name: 'ISO 45001:2018', description: 'Workplace Safety & Health Excellence', file: '', icon: '', isActive: true, order: 2 },
                { _id: new mongoose.Types.ObjectId('693864c6c1073228e8c9e041'), name: 'ISO 37001:2016', description: 'Anti-bribery Management System', file: '', icon: '', isActive: true, order: 3 }
            ],
            companyInfo: {
                name: 'Promach Pte Ltd',
                phone: '+65 6829 2136',
                email: 'enquiry@promachpl.com',
                address: '10 Anson Road, #10-11 International Plaza, Singapore 079903',
                businessHours: 'Mon-Fri: 9am-6pm, Sat: 9am-1pm'
            },
            socialMedia: {
                facebook: 'https://facebook.com/promach',
                instagram: 'https://instagram.com/promach',
                linkedin: 'https://linkedin.com/company/promach',
                youtube: ''
            },
            seo: {
                home: { title: 'Professional Aircon & Renovation Services', description: 'Quality aircon servicing and renovation in Singapore', keywords: ['aircon', 'renovation', 'Singapore'] },
                services: { title: 'Aircon Services & Pricing', description: 'Professional aircon servicing, repair, and installation', keywords: ['aircon servicing', 'aircon repair'] },
                about: { title: 'About Us', description: 'Learn about Promach and our commitment to quality', keywords: ['about', 'company'] },
                contact: { title: 'Contact Us', description: 'Get in touch with our team', keywords: ['contact', 'enquiry'] }
            }
        });

        await cmsData.save();
        console.log('✅ CMS data seeded successfully');
        console.log('   - 4 pricing tables');
        console.log('   - 11 brands with logos');
        console.log('   - 4 certificates');
        console.log('   - Company info & social media');
    } catch (error) {
        console.error('❌ Error seeding CMS data:', error.message);
    }
};

// Main seeder function
const runSeeder = async () => {
    await connectDB();
    await seedAdmin();
    await seedCMSData();

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
};

// Run the seeder
runSeeder();
