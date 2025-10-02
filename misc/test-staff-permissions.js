/**
 * Test Script for Staff Permission System
 * This script tests the staff permission middleware with different permission levels
 */

const mongoose = require('mongoose');
const Staff = require('./schema/Staff');
const User = require('./schema/User');
const { PERMISSIONS } = require('./utils/permissions');
require('dotenv').config();

// Test data
const testCoachId = new mongoose.Types.ObjectId();
const testStaffId = new mongoose.Types.ObjectId();

async function testStaffPermissions() {
    try {
        console.log('🧪 Starting Staff Permission System Tests...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Create a test coach
        console.log('📋 Test 1: Creating test coach...');
        const testCoach = new User({
            _id: testCoachId,
            name: 'Test Coach',
            email: 'testcoach@example.com',
            password: 'password123',
            role: 'coach',
            isVerified: true
        });
        await testCoach.save();
        console.log('✅ Test coach created\n');

        // Test 2: Create staff with different permission levels
        console.log('📋 Test 2: Creating staff with different permission levels...\n');

        // Staff with full lead permissions
        const leadManagerStaff = new Staff({
            _id: new mongoose.Types.ObjectId(),
            name: 'Lead Manager',
            email: 'leadmanager@example.com',
            password: 'password123',
            role: 'staff',
            coachId: testCoachId,
            permissions: [
                PERMISSIONS.LEADS.READ,
                PERMISSIONS.LEADS.WRITE,
                PERMISSIONS.LEADS.UPDATE,
                PERMISSIONS.LEADS.DELETE,
                PERMISSIONS.LEADS.MANAGE
            ],
            isActive: true,
            isVerified: true
        });
        await leadManagerStaff.save();
        console.log('✅ Lead Manager staff created with full lead permissions');

        // Staff with read-only funnel permissions
        const funnelViewerStaff = new Staff({
            _id: new mongoose.Types.ObjectId(),
            name: 'Funnel Viewer',
            email: 'funnelviewer@example.com',
            password: 'password123',
            role: 'staff',
            coachId: testCoachId,
            permissions: [
                PERMISSIONS.FUNNELS.READ,
                PERMISSIONS.FUNNELS.VIEW_ANALYTICS
            ],
            isActive: true,
            isVerified: true
        });
        await funnelViewerStaff.save();
        console.log('✅ Funnel Viewer staff created with read-only funnel permissions');

        // Staff with dashboard access only
        const dashboardViewerStaff = new Staff({
            _id: new mongoose.Types.ObjectId(),
            name: 'Dashboard Viewer',
            email: 'dashboardviewer@example.com',
            password: 'password123',
            role: 'staff',
            coachId: testCoachId,
            permissions: [
                PERMISSIONS.PERFORMANCE.READ,
                PERMISSIONS.LEADS.READ
            ],
            isActive: true,
            isVerified: true
        });
        await dashboardViewerStaff.save();
        console.log('✅ Dashboard Viewer staff created with limited permissions');

        // Staff with no permissions
        const noPermissionStaff = new Staff({
            _id: new mongoose.Types.ObjectId(),
            name: 'No Permission Staff',
            email: 'nopermission@example.com',
            password: 'password123',
            role: 'staff',
            coachId: testCoachId,
            permissions: [],
            isActive: true,
            isVerified: true
        });
        await noPermissionStaff.save();
        console.log('✅ No Permission staff created with empty permissions\n');

        // Test 3: Test permission checking functions
        console.log('📋 Test 3: Testing permission checking functions...\n');

        const StaffPermissionMiddleware = require('./middleware/staffPermissionMiddleware');

        // Test lead permissions
        console.log('🔍 Testing Lead Manager permissions:');
        const leadManagerPermissions = await StaffPermissionMiddleware.getStaffPermissions(leadManagerStaff._id);
        console.log('   Permissions:', leadManagerPermissions?.permissions);
        console.log('   Can read leads:', leadManagerPermissions?.permissions.includes(PERMISSIONS.LEADS.READ));
        console.log('   Can write leads:', leadManagerPermissions?.permissions.includes(PERMISSIONS.LEADS.WRITE));
        console.log('   Can delete leads:', leadManagerPermissions?.permissions.includes(PERMISSIONS.LEADS.DELETE));

        console.log('\n🔍 Testing Funnel Viewer permissions:');
        const funnelViewerPermissions = await StaffPermissionMiddleware.getStaffPermissions(funnelViewerStaff._id);
        console.log('   Permissions:', funnelViewerPermissions?.permissions);
        console.log('   Can read funnels:', funnelViewerPermissions?.permissions.includes(PERMISSIONS.FUNNELS.READ));
        console.log('   Can write funnels:', funnelViewerPermissions?.permissions.includes(PERMISSIONS.FUNNELS.WRITE));
        console.log('   Can view analytics:', funnelViewerPermissions?.permissions.includes(PERMISSIONS.FUNNELS.VIEW_ANALYTICS));

        console.log('\n🔍 Testing No Permission staff:');
        const noPermissionStaffPermissions = await StaffPermissionMiddleware.getStaffPermissions(noPermissionStaff._id);
        console.log('   Permissions:', noPermissionStaffPermissions?.permissions);
        console.log('   Can read leads:', noPermissionStaffPermissions?.permissions.includes(PERMISSIONS.LEADS.READ));

        // Test 4: Test middleware functions
        console.log('\n📋 Test 4: Testing middleware functions...\n');

        // Mock request object for testing
        const mockReq = {
            role: 'staff',
            userId: leadManagerStaff._id,
            coachId: testCoachId
        };

        const mockRes = {
            status: (code) => ({
                json: (data) => {
                    console.log(`   Response ${code}:`, data);
                    return { status: code, json: data };
                }
            })
        };

        const mockNext = () => {
            console.log('   ✅ Middleware passed - next() called');
        };

        // Test lead permission middleware
        console.log('🔍 Testing lead permission middleware with Lead Manager:');
        const leadPermissionMiddleware = StaffPermissionMiddleware.checkLeadPermission('read');
        await leadPermissionMiddleware(mockReq, mockRes, mockNext);

        // Test with no permission staff
        console.log('\n🔍 Testing lead permission middleware with No Permission staff:');
        mockReq.userId = noPermissionStaff._id;
        await leadPermissionMiddleware(mockReq, mockRes, mockNext);

        // Test 5: Test different permission scenarios
        console.log('\n📋 Test 5: Testing different permission scenarios...\n');

        // Test funnel permissions
        console.log('🔍 Testing funnel permissions:');
        mockReq.userId = funnelViewerStaff._id;
        const funnelPermissionMiddleware = StaffPermissionMiddleware.checkFunnelPermission('read');
        await funnelPermissionMiddleware(mockReq, mockRes, mockNext);

        console.log('\n🔍 Testing funnel write permission (should fail):');
        const funnelWriteMiddleware = StaffPermissionMiddleware.checkFunnelPermission('write');
        await funnelWriteMiddleware(mockReq, mockRes, mockNext);

        // Test dashboard permissions
        console.log('\n🔍 Testing dashboard permissions:');
        mockReq.userId = dashboardViewerStaff._id;
        const dashboardMiddleware = StaffPermissionMiddleware.checkDashboardPermission('overview');
        await dashboardMiddleware(mockReq, mockRes, mockNext);

        console.log('\n🔍 Testing ads permission (should fail):');
        const adsMiddleware = StaffPermissionMiddleware.checkAdsPermission('read');
        await adsMiddleware(mockReq, mockRes, mockNext);

        // Test 6: Test permission groups
        console.log('\n📋 Test 6: Testing permission groups...\n');

        const { PERMISSION_GROUPS } = require('./utils/permissions');
        
        console.log('📊 Available permission groups:');
        Object.keys(PERMISSION_GROUPS).forEach(groupName => {
            console.log(`   - ${groupName}: ${PERMISSION_GROUPS[groupName].length} permissions`);
        });

        console.log('\n📊 Lead Manager group permissions:');
        console.log('   Permissions:', PERMISSION_GROUPS['Lead Manager']);

        console.log('\n📊 Funnel Manager group permissions:');
        console.log('   Permissions:', PERMISSION_GROUPS['Funnel Manager']);

        // Test 7: Cleanup
        console.log('\n📋 Test 7: Cleaning up test data...\n');

        await Staff.deleteMany({ coachId: testCoachId });
        await User.deleteOne({ _id: testCoachId });
        
        console.log('✅ Test data cleaned up');
        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the tests
if (require.main === module) {
    testStaffPermissions();
}

module.exports = { testStaffPermissions };
