const axios = require('axios');

/**
 * Test script for Staff Unified Dashboard API
 * This script tests the basic functionality of the new API endpoints
 */

const BASE_URL = 'http://localhost:5000/api/staff-unified/v1';
const TEST_STAFF_TOKEN = 'your-test-staff-jwt-token-here'; // Replace with actual staff JWT token

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${TEST_STAFF_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function testStaffUnifiedDashboardAPI() {
    console.log('🧪 Testing Staff Unified Dashboard API...\n');

    try {
        // Test 1: Get complete dashboard data
        console.log('1️⃣ Testing complete dashboard data...');
        const dashboardResponse = await api.get('/data?timeRange=7&sections=overview,leads,tasks');
        console.log('✅ Dashboard data retrieved successfully');
        console.log('📊 Sections available:', Object.keys(dashboardResponse.data.data).filter(key => key !== 'metadata'));
        console.log('🔐 Staff permissions:', dashboardResponse.data.data.metadata.permissions);
        console.log('');

        // Test 2: Get specific sections
        console.log('2️⃣ Testing individual dashboard sections...');
        
        const sections = ['overview', 'leads', 'tasks', 'marketing', 'financial', 'team', 'performance', 'calendar', 'funnels'];
        
        for (const section of sections) {
            try {
                const response = await api.get(`/${section}`);
                console.log(`✅ ${section.toUpperCase()} section accessible`);
            } catch (error) {
                if (error.response?.status === 403) {
                    console.log(`❌ ${section.toUpperCase()} section - Permission denied`);
                } else {
                    console.log(`❌ ${section.toUpperCase()} section - Error: ${error.message}`);
                }
            }
        }
        console.log('');

        // Test 3: Test funnel management
        console.log('3️⃣ Testing funnel management...');
        
        try {
            // Get all funnels
            const funnelsResponse = await api.get('/funnels');
            console.log('✅ Funnels list retrieved');
            console.log('📈 Total funnels:', funnelsResponse.data.data.totalFunnels);
            console.log('🟢 Active funnels:', funnelsResponse.data.data.activeFunnels);
            
            if (funnelsResponse.data.data.funnels.length > 0) {
                const firstFunnel = funnelsResponse.data.data.funnels[0];
                console.log('🔍 First funnel permissions:', firstFunnel.permissions);
                
                // Test getting specific funnel details
                try {
                    const funnelDetailsResponse = await api.get(`/funnels/${firstFunnel._id}`);
                    console.log('✅ Funnel details retrieved');
                } catch (error) {
                    console.log('❌ Funnel details - Error:', error.response?.data?.message || error.message);
                }
                
                // Test funnel analytics
                try {
                    const analyticsResponse = await api.get(`/funnels/${firstFunnel._id}/analytics`);
                    console.log('✅ Funnel analytics retrieved');
                } catch (error) {
                    console.log('❌ Funnel analytics - Error:', error.response?.data?.message || error.message);
                }
            }
        } catch (error) {
            console.log('❌ Funnels management - Error:', error.response?.data?.message || error.message);
        }
        console.log('');

        // Test 4: Test dashboard widgets
        console.log('4️⃣ Testing dashboard widgets...');
        
        try {
            const widgetsResponse = await api.get('/widgets');
            console.log('✅ Dashboard widgets retrieved');
            console.log('🎛️ Available widgets:', widgetsResponse.data.data.map(w => w.id));
        } catch (error) {
            console.log('❌ Dashboard widgets - Error:', error.response?.data?.message || error.message);
        }
        console.log('');

        // Test 5: Test CRUD operations for different sections
        console.log('5️⃣ Testing CRUD operations...');
        
        // Test Lead Management
        try {
            const newLead = {
                name: 'Test Lead',
                email: 'test@example.com',
                phone: '+1234567890',
                source: 'website',
                status: 'new'
            };
            
            const createLeadResponse = await api.post('/leads', newLead);
            console.log('✅ Test lead created successfully');
            
            // Update the lead
            const updateLeadResponse = await api.put(`/leads/${createLeadResponse.data.data._id}`, {
                status: 'contacted'
            });
            console.log('✅ Test lead updated successfully');
            
            // Clean up - delete the test lead
            await api.delete(`/leads/${createLeadResponse.data.data._id}`);
            console.log('✅ Test lead deleted successfully');
        } catch (error) {
            console.log('❌ Lead CRUD - Error:', error.response?.data?.message || error.message);
        }
        
        // Test Task Management
        try {
            const newTask = {
                title: 'Test Task',
                description: 'Test task created by API test',
                priority: 'medium',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            
            const createTaskResponse = await api.post('/tasks', newTask);
            console.log('✅ Test task created successfully');
            
            // Update the task
            const updateTaskResponse = await api.put(`/tasks/${createTaskResponse.data.data._id}`, {
                status: 'in_progress'
            });
            console.log('✅ Test task updated successfully');
            
            // Clean up - delete the test task
            await api.delete(`/tasks/${createTaskResponse.data.data._id}`);
            console.log('✅ Test task deleted successfully');
        } catch (error) {
            console.log('❌ Task CRUD - Error:', error.response?.data?.message || error.message);
        }
        
        // Test Funnel Management
        try {
            const newFunnel = {
                name: 'Test Funnel',
                description: 'Test funnel created by API test',
                funnelUrl: 'test-funnel-api',
                targetAudience: 'customer',
                stages: []
            };
            
            const createResponse = await api.post('/funnels', newFunnel);
            console.log('✅ Test funnel created successfully');
            console.log('🆔 New funnel ID:', createResponse.data.data._id);
            
            // Clean up - delete the test funnel
            try {
                await api.delete(`/funnels/${createResponse.data.data._id}`);
                console.log('✅ Test funnel deleted successfully');
            } catch (deleteError) {
                console.log('❌ Failed to delete test funnel:', deleteError.response?.data?.message || deleteError.message);
            }
        } catch (error) {
            console.log('❌ Funnel creation - Error:', error.response?.data?.message || error.message);
        }
        console.log('');

        console.log('🎉 Staff Unified Dashboard API testing completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Test permission validation
async function testPermissionValidation() {
    console.log('🔒 Testing permission validation...\n');
    
    const testCases = [
        { endpoint: '/leads', requiredPermission: 'leads:read' },
        { endpoint: '/tasks', requiredPermission: 'tasks:read' },
        { endpoint: '/funnels', requiredPermission: 'funnels:read' },
        { endpoint: '/financial', requiredPermission: 'performance:read' },
        { endpoint: '/team', requiredPermission: 'staff:read' }
    ];
    
    for (const testCase of testCases) {
        try {
            await api.get(testCase.endpoint);
            console.log(`✅ ${testCase.endpoint} - Permission granted`);
        } catch (error) {
            if (error.response?.status === 403) {
                console.log(`❌ ${testCase.endpoint} - Permission denied (Required: ${testCase.requiredPermission})`);
            } else {
                console.log(`❌ ${testCase.endpoint} - Error: ${error.message}`);
            }
        }
    }
}

// Run tests
if (require.main === module) {
    console.log('🚀 Starting Staff Unified Dashboard API Tests\n');
    console.log('⚠️  Make sure to:');
    console.log('   1. Update TEST_STAFF_TOKEN with a valid staff JWT token');
    console.log('   2. Ensure the server is running on localhost:5000');
    console.log('   3. Have a staff account with appropriate permissions\n');
    
    testStaffUnifiedDashboardAPI()
        .then(() => testPermissionValidation())
        .catch(console.error);
}

module.exports = {
    testStaffUnifiedDashboardAPI,
    testPermissionValidation
};
