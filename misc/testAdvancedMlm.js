const mongoose = require('mongoose');
const { 
    CoachHierarchyLevel, 
    CommissionSettings, 
    User, 
    ExternalSponsor 
} = require('../schema');

// Connect to MongoDB
const {connectDB} = require('../config/db');

async function testAdvancedMlm() {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to MongoDB');

        console.log('\n🧪 Testing Advanced MLM System...\n');

        // Test 1: Check hierarchy levels
        console.log('📋 Test 1: Checking Hierarchy Levels');
        const levels = await CoachHierarchyLevel.find({ isActive: true }).sort({ level: 1 });
        if (levels.length > 0) {
            console.log(`✅ Found ${levels.length} hierarchy levels:`);
            levels.forEach(level => {
                console.log(`   Level ${level.level}: ${level.name}`);
            });
        } else {
            console.log('❌ No hierarchy levels found. Run: node misc/seedHierarchyLevels.js');
        }

        // Test 2: Check commission settings
        console.log('\n💰 Test 2: Checking Commission Settings');
        const commissionSettings = await CommissionSettings.findOne({ isActive: true });
        if (commissionSettings) {
            console.log('✅ Commission settings found:');
            console.log(`   Commission Percentage: ${commissionSettings.commissionPercentage}%`);
            console.log(`   Minimum Amount: $${commissionSettings.minimumSubscriptionAmount}`);
            console.log(`   Maximum Limit: ${commissionSettings.maximumCommissionAmount ? `$${commissionSettings.maximumCommissionAmount}` : 'No limit'}`);
        } else {
            console.log('❌ No commission settings found. Run: node misc/seedCommissionSettings.js');
        }

        // Test 3: Check existing coaches with hierarchy
        console.log('\n👥 Test 3: Checking Existing Coaches with Hierarchy');
        const coachesWithHierarchy = await User.find({ 
            role: 'coach',
            $or: [
                { selfCoachId: { $exists: true, $ne: null } },
                { currentLevel: { $exists: true, $ne: null } },
                { sponsorId: { $exists: true, $ne: null } }
            ]
        }).select('name email selfCoachId currentLevel sponsorId hierarchyLocked');

        if (coachesWithHierarchy.length > 0) {
            console.log(`✅ Found ${coachesWithHierarchy.length} coaches with hierarchy data:`);
            coachesWithHierarchy.forEach(coach => {
                console.log(`   ${coach.name} (${coach.email}):`);
                console.log(`     Coach ID: ${coach.selfCoachId || 'Not set'}`);
                console.log(`     Level: ${coach.currentLevel || 'Not set'}`);
                console.log(`     Sponsor: ${coach.sponsorId || 'Not set'}`);
                console.log(`     Hierarchy Locked: ${coach.hierarchyLocked ? 'Yes' : 'No'}`);
            });
        } else {
            console.log('ℹ️  No existing coaches with hierarchy data found.');
        }

        // Test 4: Check external sponsors
        console.log('\n🏢 Test 4: Checking External Sponsors');
        const externalSponsors = await ExternalSponsor.find({ isActive: true });
        if (externalSponsors.length > 0) {
            console.log(`✅ Found ${externalSponsors.length} external sponsors:`);
            externalSponsors.forEach(sponsor => {
                console.log(`   ${sponsor.name} (${sponsor.email || 'No email'})`);
            });
        } else {
            console.log('ℹ️  No external sponsors found.');
        }

        // Test 5: Generate sample coach ID
        console.log('\n🆔 Test 5: Testing Coach ID Generation');
        let coachId;
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 10) {
            const randomNum = Math.floor(Math.random() * 9000000) + 1000000;
            coachId = `W${randomNum}`;
            
            const existingCoach = await User.findOne({ 
                'selfCoachId': coachId,
                role: 'coach'
            });
            
            if (!existingCoach) {
                isUnique = true;
            }
            attempts++;
        }

        if (isUnique) {
            console.log(`✅ Generated unique coach ID: ${coachId}`);
        } else {
            console.log('❌ Failed to generate unique coach ID after 10 attempts');
        }

        // Test 6: Check database indexes
        console.log('\n🔍 Test 6: Checking Database Indexes');
        try {
            const levelIndexes = await CoachHierarchyLevel.collection.indexes();
            const commissionIndexes = await CommissionSettings.collection.indexes();
            
            console.log('✅ Hierarchy level indexes:', levelIndexes.length);
            console.log('✅ Commission settings indexes:', commissionIndexes.length);
        } catch (error) {
            console.log('⚠️  Could not verify database indexes:', error.message);
        }

        console.log('\n🎉 Advanced MLM System Test Completed!');
        
        // Summary
        console.log('\n📊 Summary:');
        console.log(`   Hierarchy Levels: ${levels.length}/12`);
        console.log(`   Commission Settings: ${commissionSettings ? '✅' : '❌'}`);
        console.log(`   Coaches with Hierarchy: ${coachesWithHierarchy.length}`);
        console.log(`   External Sponsors: ${externalSponsors.length}`);
        console.log(`   Coach ID Generation: ${isUnique ? '✅' : '❌'}`);

        if (!levels.length || !commissionSettings) {
            console.log('\n🚨 Setup Required:');
            if (!levels.length) {
                console.log('   Run: node misc/seedHierarchyLevels.js');
            }
            if (!commissionSettings) {
                console.log('   Run: node misc/seedCommissionSettings.js');
            }
        }

    } catch (error) {
        console.error('❌ Error testing Advanced MLM System:', error);
        process.exit(1);
    } finally {
        // Close database connection
        mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the test
testAdvancedMlm();
