/**
 * Register the sustainability PDF documents in the CMS database.
 * The PDFs must already be present in uploads/sustainability/.
 *
 * Usage: cd back-end && node seeds/register-sustainability-docs.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CMSData = require('../src/models/CMSData');

const DOCUMENTS = [
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Sustainability Policy & Commitment',
        description: 'Promach Pte. Ltd. sustainability policy document covering our commitment, framework, key focus areas, targets, implementation approach, and continuous improvement practices.',
        file: '/uploads/sustainability/sustainability-policy.pdf',
        isActive: true,
        order: 0
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Sustainability Alternative Proposal',
        description: 'Sustainable alternatives proposed by Promach Pte. Ltd. including energy efficiency, environmentally responsible refrigerants, material optimization, waste management, and more.',
        file: '/uploads/sustainability/sustainability-proposal.pdf',
        isActive: true,
        order: 1
    }
];

async function register() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Replace documents array entirely
        const result = await CMSData.updateOne(
            {},
            { $set: { 'sustainabilityPage.documents': DOCUMENTS } }
        );

        console.log('Documents registered:', result.modifiedCount ? 'updated' : 'already current');
        console.log(`  - ${DOCUMENTS[0].name} (${DOCUMENTS[0].file})`);
        console.log(`  - ${DOCUMENTS[1].name} (${DOCUMENTS[1].file})`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('Done');
    }
}

register();
