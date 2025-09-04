/**
 * Test Script: Session File Cleanup Verification
 * 
 * This script tests the enhanced session file cleanup functionality
 * in the Baileys WhatsApp service.
 */

const fs = require('fs').promises;
const path = require('path');

// Mock the baileys_auth directory structure
const BAILEYS_AUTH_DIR = path.join(__dirname, '../baileys_auth');
const TEST_USER_ID = 'test_user_123';

async function createMockSessionFiles() {
    console.log('🧪 Creating mock session files for testing...');
    
    try {
        // Create test user directory
        const userDir = path.join(BAILEYS_AUTH_DIR, TEST_USER_ID);
        await fs.mkdir(userDir, { recursive: true });
        
        // Create mock session files
        const mockFiles = [
            'app-state-sync-key.json',
            'app-state-sync-version.json',
            'auth_info_baileys.json',
            'creds.json',
            'session.json',
            'keystore.json'
        ];
        
        for (const file of mockFiles) {
            const filePath = path.join(userDir, file);
            await fs.writeFile(filePath, JSON.stringify({ test: true, timestamp: Date.now() }));
            console.log(`✅ Created mock file: ${file}`);
        }
        
        console.log(`🎯 Mock session files created in: ${userDir}`);
        return userDir;
        
    } catch (error) {
        console.error('❌ Error creating mock session files:', error);
        throw error;
    }
}

async function verifySessionFilesExist(userDir) {
    try {
        const files = await fs.readdir(userDir);
        console.log(`📁 Found ${files.length} files in session directory:`);
        files.forEach(file => console.log(`   - ${file}`));
        return files.length > 0;
    } catch (error) {
        console.error('❌ Error reading session directory:', error);
        return false;
    }
}

async function testCleanupSessionFiles() {
    console.log('\n🧹 Testing session file cleanup functionality...');
    
    try {
        // Import the service (this will test the actual implementation)
        const BaileysService = require('../services/baileysWhatsAppService');
        
        // Test the cleanup method
        console.log('🔄 Calling cleanupSessionFiles...');
        await BaileysService.cleanupSessionFiles(TEST_USER_ID, 'coach');
        
        // Verify files are cleaned up
        console.log('🔍 Verifying cleanup results...');
        try {
            const userDir = path.join(BAILEYS_AUTH_DIR, TEST_USER_ID);
            await fs.access(userDir);
            console.log('❌ Session directory still exists - cleanup may have failed');
            return false;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('✅ Session directory successfully removed - cleanup successful!');
                return true;
            } else {
                console.error('❌ Unexpected error during verification:', error);
                return false;
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing cleanup functionality:', error);
        return false;
    }
}

async function runTest() {
    console.log('🚀 Starting Session File Cleanup Test\n');
    
    try {
        // Step 1: Create mock session files
        const userDir = await createMockSessionFiles();
        
        // Step 2: Verify files exist
        const filesExist = await verifySessionFilesExist(userDir);
        if (!filesExist) {
            console.log('❌ Test failed: Mock files not created');
            return;
        }
        
        // Step 3: Test cleanup functionality
        const cleanupSuccess = await testCleanupSessionFiles();
        
        // Step 4: Final verification
        if (cleanupSuccess) {
            console.log('\n🎉 All tests passed! Session file cleanup is working correctly.');
        } else {
            console.log('\n❌ Test failed! Session file cleanup has issues.');
        }
        
    } catch (error) {
        console.error('\n💥 Test execution failed:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    runTest().catch(console.error);
}

module.exports = {
    createMockSessionFiles,
    verifySessionFilesExist,
    testCleanupSessionFiles,
    runTest
};
