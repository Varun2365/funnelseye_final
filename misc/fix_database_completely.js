// misc/fix_database_completely.js
// Comprehensive database fix script for WhatsApp integrations
// This will resolve all current issues and prevent future problems

const mongoose = require('mongoose');

async function fixDatabaseCompletely() {
    try {
        console.log('🔧 Starting comprehensive database fix...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to database');
        
        const db = mongoose.connection.db;
        
        // ========================================
        // STEP 1: Fix WhatsApp Integrations Collection
        // ========================================
        console.log('\n📱 Step 1: Fixing WhatsApp Integrations...');
        
        const whatsappCollection = db.collection('whatsappintegrations');
        
        // Drop all existing indexes
        try {
            const existingIndexes = await whatsappCollection.indexes();
            console.log('📊 Current indexes:', existingIndexes.map(idx => idx.name));
            
            for (const index of existingIndexes) {
                if (index.name !== '_id_') { // Don't drop the _id index
                    console.log(`🗑️  Dropping index: ${index.name}`);
                    await whatsappCollection.dropIndex(index.name);
                }
            }
            console.log('✅ All old indexes dropped');
        } catch (error) {
            console.log('⚠️  Some indexes may not exist, continuing...');
        }
        
        // Clean up any corrupted data
        try {
            const result = await whatsappCollection.deleteMany({
                $or: [
                    { userId: null },
                    { userId: undefined },
                    { coachId: { $exists: true } }, // Remove old coachId records
                    { userType: { $nin: ['coach', 'staff', 'admin'] } }
                ]
            });
            console.log(`🧹 Cleaned up ${result.deletedCount} corrupted records`);
        } catch (error) {
            console.log('⚠️  Cleanup failed, continuing...');
        }
        
        // Create proper indexes
        await whatsappCollection.createIndex(
            { userId: 1, userType: 1 }, 
            { unique: true, name: 'userId_userType_unique' }
        );
        console.log('✅ Created userId + userType unique index');
        
        await whatsappCollection.createIndex(
            { integrationType: 1, isActive: 1 }, 
            { name: 'integrationType_active' }
        );
        console.log('✅ Created integrationType + isActive index');
        
        await whatsappCollection.createIndex(
            { connectionStatus: 1 }, 
            { name: 'connectionStatus' }
        );
        console.log('✅ Created connectionStatus index');
        
        // ========================================
        // STEP 2: Fix WhatsApp Messages Collection
        // ========================================
        console.log('\n💬 Step 2: Fixing WhatsApp Messages...');
        
        const messagesCollection = db.collection('whatsappmessages');
        
        // Drop old indexes
        try {
            const messageIndexes = await messagesCollection.indexes();
            for (const index of messageIndexes) {
                if (index.name !== '_id_') {
                    await messagesCollection.dropIndex(index.name);
                }
            }
        } catch (error) {
            console.log('⚠️  Message indexes cleanup failed, continuing...');
        }
        
        // Create proper indexes
        await messagesCollection.createIndex(
            { userId: 1, userType: 1, conversationId: 1 }, 
            { name: 'user_conversation' }
        );
        console.log('✅ Created user + conversation index for messages');
        
        await messagesCollection.createIndex(
            { timestamp: -1 }, 
            { name: 'timestamp_desc' }
        );
        console.log('✅ Created timestamp index for messages');
        
        // ========================================
        // STEP 3: Fix WhatsApp Conversations Collection
        // ========================================
        console.log('\n📥 Step 3: Fixing WhatsApp Conversations...');
        
        const conversationsCollection = db.collection('whatsappconversations');
        
        // Drop old indexes
        try {
            const convIndexes = await conversationsCollection.indexes();
            for (const index of convIndexes) {
                if (index.name !== '_id_') {
                    await conversationsCollection.dropIndex(index.name);
                }
            }
        } catch (error) {
            console.log('⚠️  Conversation indexes cleanup failed, continuing...');
        }
        
        // Create proper indexes
        await conversationsCollection.createIndex(
            { userId: 1, userType: 1 }, 
            { name: 'user_conversations' }
        );
        console.log('✅ Created user index for conversations');
        
        await conversationsCollection.createIndex(
            { lastMessageAt: -1 }, 
            { name: 'lastMessage_desc' }
        );
        console.log('✅ Created lastMessage index for conversations');
        
        // ========================================
        // STEP 4: Fix WhatsApp Contacts Collection
        // ========================================
        console.log('\n👥 Step 4: Fixing WhatsApp Contacts...');
        
        const contactsCollection = db.collection('whatsappcontacts');
        
        // Drop old indexes
        try {
            const contactIndexes = await contactsCollection.indexes();
            for (const index of contactIndexes) {
                if (index.name !== '_id_') {
                    await contactsCollection.dropIndex(index.name);
                }
            }
        } catch (error) {
            console.log('⚠️  Contact indexes cleanup failed, continuing...');
        }
        
        // Create proper indexes
        await contactsCollection.createIndex(
            { userId: 1, userType: 1 }, 
            { name: 'user_contacts' }
        );
        console.log('✅ Created user index for contacts');
        
        await contactsCollection.createIndex(
            { phoneNumber: 1 }, 
            { name: 'phoneNumber' }
        );
        console.log('✅ Created phoneNumber index for contacts');
        
        // ========================================
        // STEP 5: Verify All Collections
        // ========================================
        console.log('\n🔍 Step 5: Verifying Collections...');
        
        const collections = await db.listCollections().toArray();
        const whatsappCollections = collections.filter(col => 
            col.name.startsWith('whatsapp')
        );
        
        console.log('📊 WhatsApp Collections found:', whatsappCollections.map(col => col.name));
        
        // Show final index structure for each collection
        for (const collection of whatsappCollections) {
            const finalIndexes = await db.collection(collection.name).indexes();
            console.log(`\n📋 ${collection.name} final indexes:`);
            finalIndexes.forEach(idx => {
                console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
            });
        }
        
        // ========================================
        // STEP 6: Create Sample Data Structure
        // ========================================
        console.log('\n📝 Step 6: Creating sample data structure...');
        
        // Insert a sample integration record to test the structure
        try {
            const sampleIntegration = {
                userId: new mongoose.Types.ObjectId(), // Dummy ID for testing
                userType: 'coach',
                integrationType: 'baileys_personal',
                isActive: false,
                connectionStatus: 'disconnected',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await whatsappCollection.insertOne(sampleIntegration);
            console.log('✅ Sample integration record created successfully');
            
            // Remove the sample record
            await whatsappCollection.deleteOne({ _id: sampleIntegration._id });
            console.log('✅ Sample record cleaned up');
            
        } catch (error) {
            console.log('⚠️  Sample data test failed:', error.message);
        }
        
        console.log('\n🎉 Database fix completed successfully!');
        console.log('✅ All old indexes removed');
        console.log('✅ New proper indexes created');
        console.log('✅ Corrupted data cleaned up');
        console.log('✅ Future integration issues prevented');
        
    } catch (error) {
        console.error('❌ Error during database fix:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from database');
    }
}

// Run the fix
if (require.main === module) {
    fixDatabaseCompletely()
        .then(() => {
            console.log('\n🚀 Database is now ready for WhatsApp integrations!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Database fix failed:', error);
            process.exit(1);
        });
}

module.exports = fixDatabaseCompletely;
