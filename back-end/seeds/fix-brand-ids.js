/**
 * Fix Brand IDs Migration Script
 * 
 * This script adds persistent _id to brandsWithLogos subdocuments
 * that were created without IDs by the seeder.
 * 
 * Run: node seeds/fix-brand-ids.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const fixBrandIds = async () => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('cmsdatas');

        // Find the CMS document
        const cmsDoc = await collection.findOne({ key: 'main' });

        if (!cmsDoc) {
            console.log('No CMS document found');
            return;
        }

        console.log('Current brandsWithLogos:', JSON.stringify(cmsDoc.brandsWithLogos, null, 2));

        // Check if brands have _id
        const needsFix = cmsDoc.brandsWithLogos?.some(b => !b._id);

        if (!needsFix) {
            console.log('✅ All brands already have _id fields');
            return;
        }

        // Add _id to each brand that doesn't have one
        const fixedBrands = cmsDoc.brandsWithLogos.map(brand => ({
            ...brand,
            _id: brand._id || new mongoose.Types.ObjectId()
        }));

        // Update the document
        await collection.updateOne(
            { key: 'main' },
            { $set: { brandsWithLogos: fixedBrands } }
        );

        console.log('✅ Fixed! New brandsWithLogos:');
        console.log(JSON.stringify(fixedBrands, null, 2));

    } catch (error) {
        console.error('❌ Error fixing brand IDs:', error);
    }
};

const run = async () => {
    await connectDB();
    await fixBrandIds();
    console.log('\n✨ Done!');
    process.exit(0);
};

run();
