const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');
const baileysRoutes = require('./routes/baileysRoutes');
const testingRoutes = require('./routes/testingRoutes');
const rabbitmqService = require('./services/rabbitmqService');
const rpcConsumer = require('./services/rpcConsumer');
const { setupGlobalErrorHandlers } = require('./utils/errorHandlers');

const app = express();

// Global error handlers
setupGlobalErrorHandlers();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Request logging (filtered)
app.use((req, res, next) => {
    // Skip logging for Chrome DevTools requests
    if (!req.path.includes('.well-known') && !req.path.includes('devtools')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'baileys-whatsapp-microservice',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/baileys', baileysRoutes);

// Testing routes (no database dependency)
app.use('/testing', testingRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Database connection
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        console.log('📊 Database:', config.MONGODB_URI);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// RabbitMQ connection
rabbitmqService.connect()
    .then(async () => {
        console.log('✅ RabbitMQ service initialized');
        // Start RPC consumers after RabbitMQ is connected
        try {
            await rpcConsumer.startConsuming();
            console.log('✅ RPC consumers started');
        } catch (error) {
            console.error('❌ RPC consumer error:', error);
        }
    })
    .catch((error) => {
        console.error('❌ RabbitMQ connection error:', error);
        // Don't exit on RabbitMQ failure, but log it
    });

// Start server
const server = app.listen(config.PORT, () => {
    console.log('🚀 Baileys WhatsApp Microservice started!');
    console.log(`📡 Port: ${config.PORT}`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${config.PORT}/health`);
    console.log(`📱 API Base: http://localhost:${config.PORT}/api/baileys`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await rabbitmqService.close();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await rabbitmqService.close();
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

module.exports = app;
