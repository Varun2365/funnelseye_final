// misc/fix_whatsapp_indexes.js
// Script to fix conflicting WhatsApp integration database indexes

const mongoose = require('mongoose');
const { WhatsAppIntegration } = require('../schema');

async function fixWhatsAppIndexes() {
    try {
        console.log('🔧 Fixing WhatsApp integration indexes...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to database');
        
        // Get the collection
        const collection = mongoose.connection.db.collection('whatsappintegrations');
        
        // List all indexes
        const indexes = await collection.indexes();
        console.log('📊 Current indexes:', indexes.map(idx => idx.name));
        
        // Check if the problematic coachId index exists
        const coachIdIndex = indexes.find(idx => idx.name === 'coachId_1');
        
        if (coachIdIndex) {
            console.log('🚨 Found problematic coachId_1 index, dropping it...');
            await collection.dropIndex('coachId_1');
            console.log('✅ Dropped coachId_1 index');
        } else {
            console.log('✅ No problematic coachId_1 index found');
        }
        
        // Check if the correct userId index exists
        const userIdIndex = indexes.find(idx => 
            idx.key && idx.key.userId === 1 && idx.key.userType === 1
        );
        
        if (!userIdIndex) {
            console.log('🔧 Creating correct userId + userType index...');
            await collection.createIndex(
                { userId: 1, userType: 1 }, 
                { unique: true, name: 'userId_userType_1' }
            );
            console.log('✅ Created userId + userType unique index');
        } else {
            console.log('✅ Correct userId + userType index already exists');
        }
        
        // List final indexes
        const finalIndexes = await collection.indexes();
        console.log('📊 Final indexes:', finalIndexes.map(idx => idx.name));
        
        console.log('🎉 WhatsApp integration indexes fixed successfully!');
        
    } catch (error) {
        console.error('❌ Error fixing indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

// Run the fix
if (require.main === module) {
    fixWhatsAppIndexes();
}

module.exports = fixWhatsAppIndexes;
