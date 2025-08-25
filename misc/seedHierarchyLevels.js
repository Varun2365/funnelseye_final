const mongoose = require('mongoose');
const { CoachHierarchyLevel } = require('../schema');

// Connect to MongoDB
const connectDB = require('../config/db');

const hierarchyLevels = [
    {
        level: 1,
        name: 'Distributor Coach',
        description: 'Entry level coach position',
        isActive: true
    },
    {
        level: 2,
        name: 'Senior Consultant',
        description: 'Experienced consultant level',
        isActive: true
    },
    {
        level: 3,
        name: 'Success Builder',
        description: 'Success-focused coach level',
        isActive: true
    },
    {
        level: 4,
        name: 'Supervisor',
        description: 'Supervisory role level',
        isActive: true
    },
    {
        level: 5,
        name: 'World Team',
        description: 'World team level',
        isActive: true
    },
    {
        level: 6,
        name: 'G.E.T Team',
        description: 'G.E.T team level',
        isActive: true
    },
    {
        level: 7,
        name: 'Get 2500 Team',
        description: '2500 team level',
        isActive: true
    },
    {
        level: 8,
        name: 'Millionaire Team',
        description: 'Millionaire team level',
        isActive: true
    },
    {
        level: 9,
        name: 'Millionaire 7500 Team',
        description: '7500 millionaire team level',
        isActive: true
    },
    {
        level: 10,
        name: "President's Team",
        description: 'President team level',
        isActive: true
    },
    {
        level: 11,
        name: "Chairman's Club",
        description: 'Chairman club level',
        isActive: true
    },
    {
        level: 12,
        name: "Founder's Circle",
        description: 'Founder circle level',
        isActive: true
    }
];

async function seedHierarchyLevels() {
    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Check if levels already exist
        const existingLevels = await CoachHierarchyLevel.find({});
        
        if (existingLevels.length > 0) {
            console.log('⚠️  Hierarchy levels already exist. Skipping seeding.');
            console.log(`Found ${existingLevels.length} existing levels`);
            process.exit(0);
        }

        // Create a default admin user ID for seeding
        const defaultAdminId = new mongoose.Types.ObjectId();

        // Seed hierarchy levels
        const seededLevels = [];
        for (const levelData of hierarchyLevels) {
            const level = new CoachHierarchyLevel({
                ...levelData,
                createdBy: defaultAdminId
            });
            seededLevels.push(level);
        }

        await CoachHierarchyLevel.insertMany(seededLevels);
        
        console.log('✅ Successfully seeded hierarchy levels:');
        seededLevels.forEach(level => {
            console.log(`   Level ${level.level}: ${level.name}`);
        });

        console.log(`\n📊 Total levels seeded: ${seededLevels.length}`);
        console.log('🎯 Hierarchy levels are now ready for use!');

    } catch (error) {
        console.error('❌ Error seeding hierarchy levels:', error);
        process.exit(1);
    } finally {
        // Close database connection
        // mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the seeding function
seedHierarchyLevels();
