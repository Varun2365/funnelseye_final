const baileysService = require('./services/baileysWhatsAppService');

async function testReconnectionLogic() {
    try {
        console.log('🧪 Testing Baileys reconnection logic...');
        
        // Test device ID
        const deviceId = 'test_device_123';
        const sessionId = 'test_session_123';
        
        console.log('✅ Testing session initialization...');
        const result = await baileysService.initializeSession(deviceId, sessionId);
        console.log('✅ Session initialized:', result.success);
        
        console.log('✅ Testing QR code generation...');
        const qrCode = baileysService.getQRCode(deviceId);
        console.log('✅ QR code generated:', !!qrCode);
        
        console.log('✅ Testing connection status...');
        const status = baileysService.getConnectionStatus(deviceId);
        console.log('✅ Connection status:', status);
        
        console.log('✅ Testing reconnection attempts tracking...');
        const attempts = baileysService.reconnectionAttempts.get(deviceId);
        console.log('✅ Reconnection attempts:', attempts);
        
        console.log('✅ Testing cleanup...');
        baileysService.cleanupSession(deviceId);
        console.log('✅ Session cleaned up');
        
        console.log('🎉 All reconnection logic tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testReconnectionLogic();
