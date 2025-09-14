const setupGlobalErrorHandlers = () => {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('🚨 [CRITICAL] Uncaught Exception:', error);
        
        // Don't exit the process for Baileys-related errors or logger errors
        if (error.message && (
            error.message.includes('Baileys') || 
            error.message.includes('logger') ||
            error.message.includes('logger.error') ||
            error.message.includes('logger.trace') ||
            error.message.includes('logger.info')
        )) {
            console.error('🔧 Baileys/Logger error detected - continuing service...');
            return;
        }
        
        // For other critical errors, exit gracefully
        console.error('💥 Critical error - shutting down gracefully...');
        process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('🚨 [CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
        
        // Don't exit the process for Baileys-related rejections or logger errors
        if (reason && reason.message && (
            reason.message.includes('Baileys') || 
            reason.message.includes('logger') ||
            reason.message.includes('logger.error') ||
            reason.message.includes('logger.trace') ||
            reason.message.includes('logger.info')
        )) {
            console.error('🔧 Baileys/Logger rejection detected - continuing service...');
            return;
        }
        
        // For other critical rejections, log but continue
        console.error('⚠️ Unhandled rejection - continuing service...');
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
        console.log('📡 SIGTERM received, shutting down gracefully');
        process.exit(0);
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
        console.log('📡 SIGINT received, shutting down gracefully');
        process.exit(0);
    });

    console.log('✅ Global error handlers set up');
};

module.exports = {
    setupGlobalErrorHandlers
};
