// misc/test_cors.js
// Simple script to test consolidated CORS configuration

const axios = require('axios');
const { corsOptions, isOriginAllowed } = require('../config/cors');

const BASE_URL = 'https://api.funnelseye.com'; // Your API base URL

async function testCORS() {
    console.log('🧪 Testing Consolidated CORS Configuration...\n');
    console.log('📍 Primary development port (localhost:5000) should be ALLOWED for all routes\n');

    const testOrigins = [
        'http://localhost:5000',        // Primary development port - SHOULD BE ALLOWED
        'http://127.0.0.1:5000',       // Primary development port - SHOULD BE ALLOWED
        'http://localhost:3000',        // Secondary development port
        'http://127.0.0.1:3000',       // Secondary development port
        'https://funnelseye.com',       // Production domain
        'https://app.funnelseye.com',   // Production app domain
        'https://blocked-domain.com'    // Should be blocked
    ];

    for (const origin of testOrigins) {
        try {
            console.log(`Testing origin: ${origin}`);
            
            // Test the CORS validation function first
            const isAllowed = isOriginAllowed(origin);
            console.log(`  CORS validation: ${isAllowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
            
            // Test actual API call
            const response = await axios.get(`${BASE_URL}/api/health`, {
                headers: {
                    'Origin': origin
                },
                validateStatus: () => true // Don't throw on non-2xx status
            });

            if (response.status === 200) {
                console.log(`  API response: ✅ SUCCESS (Status: ${response.status})`);
            } else {
                console.log(`  API response: ❌ FAILED (Status: ${response.status})`);
            }
        } catch (error) {
            if (error.response) {
                console.log(`  API response: ❌ ERROR (Status: ${error.response.status})`);
            } else {
                console.log(`  API response: ❌ ERROR: ${error.message}`);
            }
        }
        console.log('---');
    }

    // Test specific localhost:5000 priority
    console.log('🔍 Testing localhost:5000 Priority Access...');
    const localhost5000 = 'http://localhost:5000';
    const isLocalhost5000Allowed = isOriginAllowed(localhost5000);
    console.log(`localhost:5000 access: ${isLocalhost5000Allowed ? '✅ PRIORITY ALLOWED' : '❌ BLOCKED'}`);
    
    if (isLocalhost5000Allowed) {
        console.log('✅ localhost:5000 is properly configured for all routes');
    } else {
        console.log('❌ localhost:5000 is NOT properly configured');
    }

    // Test the specific staff route that was having CORS issues
    console.log('\n🔍 Testing Staff Route CORS (the problematic route)...');
    try {
        const staffResponse = await axios.options(`${BASE_URL}/api/staff`, {
            headers: {
                'Origin': 'http://localhost:5000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'x-coach-id,authorization,content-type'
            },
            validateStatus: () => true
        });

        console.log(`Staff route OPTIONS response: ${staffResponse.status}`);
        console.log(`CORS Headers:`);
        console.log(`  Access-Control-Allow-Origin: ${staffResponse.headers['access-control-allow-origin']}`);
        console.log(`  Access-Control-Allow-Methods: ${staffResponse.headers['access-control-allow-methods']}`);
        console.log(`  Access-Control-Allow-Headers: ${staffResponse.headers['access-control-allow-headers']}`);
        console.log(`  Access-Control-Allow-Credentials: ${staffResponse.headers['access-control-allow-credentials']}`);

        if (staffResponse.headers['access-control-allow-headers'] && 
            staffResponse.headers['access-control-allow-headers'].toLowerCase().includes('x-coach-id')) {
            console.log('✅ x-coach-id header is properly allowed in CORS');
        } else {
            console.log('❌ x-coach-id header is NOT properly allowed in CORS');
        }

    } catch (error) {
        console.log(`❌ Staff route OPTIONS test failed: ${error.message}`);
        if (error.response) {
            console.log(`  Status: ${error.response.status}`);
            console.log(`  Headers:`, error.response.headers);
        }
    }

    console.log('\n🎯 Consolidated CORS Test Complete!');
    console.log('📝 All CORS configuration is now centralized in config/cors.js');
}

// Run the test if this file is executed directly
if (require.main === module) {
    testCORS().catch(console.error);
}

module.exports = { testCORS };
