

// 🚀 Load environment variables from .env file
require('dotenv').config({ quiet: true });

// 📦 Core Node.js Modules
const express = require('express');
const http = require('http');
const path = require('path');

// 🌐 Socket.IO Imports
const { Server } = require('socket.io');

// ⚙️ Configuration & Utilities
const { connectDB } = require('./config/db');
const checkInactiveCoaches = require('./tasks/checkInactiveCoaches');
const { init } = require('./services/rabbitmqProducer');
const sslService = require('./services/sslService');
const zoomCleanupService = require('./services/zoomCleanupService');

// 🛡️ Middleware Imports
const cors = require('cors');
const adminAuth = require('./middleware/adminAuth');

// 🛣️ Route Imports
const authRoutes = require('./routes/authRoutes.js');
const funnelRoutes = require('./routes/funnelRoutes');
const customUrlRoutes = require('./routes/customUrlRoutes');
const customDomainRoutes = require('./routes/customDomainRoutes');
const leadRoutes = require('./routes/leadRoutes.js');
const automationRuleRoutes = require('./routes/automationRuleRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes');
const webpageRenderRoutes = require('./routes/webpageRenderRoutes');
const dailyPriorityFeedRoutes = require('./routes/dailyPriorityFeedRoutes');
const advancedMlmRoutes = require('./routes/advancedMlmRoutes');
const coachRoutes = require('./routes/coachRoutes');
const metaRoutes = require('./routes/metaRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const staffRoutes = require('./routes/staffRoutes.js');
const adsRoutes = require('./routes/adsRoutes');
const aiAdsRoutes = require('./routes/aiAdsRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const staffLeaderboardRoutes = require('./routes/staffLeaderboardRoutes');
const coachDashboardRoutes = require('./routes/coachDashboardRoutes');
const staffDashboardRoutes = require('./routes/staffDashboardRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const cartRoutes = require('./routes/cartRoutes');
const nurturingSequenceRoutes = require('./routes/nurturingSequenceRoutes');
const leadMagnetsRoutes = require('./routes/leadMagnetsRoutes');
const leadNurturingRoutes = require('./routes/leadNurturingRoutes');
const leadScoringTrackingRoutes = require('./routes/leadScoringTrackingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminLogsRoutes = require('./routes/adminLogsRoutes');
const adminSettingsRoutes = require('./routes/adminSettingsRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const zoomIntegrationRoutes = require('./routes/zoomIntegrationRoutes');
const messageTemplateRoutes = require('./routes/messageTemplateRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const coachHierarchyRoutes = require('./routes/coachHierarchyRoutes');
const apiDocsRoutes = require('./routes/apiDocsRoutes');

// --- Import the worker initialization functions ---
const initRulesEngineWorker = require('./workers/worker_rules_engine');
const initActionExecutorWorker = require('./workers/worker_action_executor');
const initScheduledExecutorWorker = require('./workers/worker_scheduled_action_executor');
const initPaymentProcessorWorker = require('./workers/worker_payment_processor');
const initNurturingWorker = require('./workers/worker_nurturing_sequence');

// --- END ROUTES DATA ---

// 🌐 Initialize Express App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5000",
        methods: ["GET", "POST"]
    }
});

// Socket.IO event handlers for admin notifications
io.on('connection', (socket) => {
    // Admin joins admin room
    socket.on('admin-join', (adminId) => {
        socket.join('admin-room');
        socket.join(`admin-${adminId}`);
    });

    // Coach joins coach room
    socket.on('coach-join', (coachId) => {
        socket.join('coach-room');
        socket.join(`user-${coachId}`);
    });

    // User joins specific user room
    socket.on('user-join', (userId) => {
        socket.join(`user-${userId}`);
    });

    // Handle admin notifications
    socket.on('admin-notification', (data) => {
        socket.to('admin-room').emit('admin-notification', data);
    });

    // Handle coach notifications
    socket.on('coach-notification', (data) => {
        socket.to('coach-room').emit('coach-notification', data);
    });

    // Handle global notifications
    socket.on('global-notification', (data) => {
        io.emit('global-notification', data);
    });
});

// ✨ Express Middleware Setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 🌐 Custom Domain Routing Middleware
app.use(async (req, res, next) => {
    const hostname = req.hostname;

    // Skip if it's the main domain or localhost
    if (hostname === 'api.funnelseye.com' || hostname === 'localhost' || hostname === '127.0.0.1') {
        return next();
    }

    try {
        const CustomDomain = require('./schema/CustomDomain');
        const customDomain = await CustomDomain.findByHostname(hostname);

        if (customDomain) {
            // Add domain info to request for use in other middleware/routes
            req.customDomain = customDomain;
            req.coachId = customDomain.coachId; // Set coach context for the request
        }
    } catch (error) {
        console.error('Error resolving custom domain:', error);
    }

    next();
});

// 🔗 Mount API Routes
// ===== CORE AUTHENTICATION & USER MANAGEMENT =====
app.use('/api/auth', authRoutes);

// ===== FUNNEL & LEAD MANAGEMENT =====
app.use('/api/funnels', funnelRoutes);
app.use('/api/custom-urls', customUrlRoutes);
app.use('/api/custom-domains', customDomainRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/lead-magnets', leadMagnetsRoutes);
app.use('/api/lead-nurturing', leadNurturingRoutes);
app.use('/api/nurturing-sequences', nurturingSequenceRoutes);
app.use('/api/lead-scoring', leadScoringTrackingRoutes);

// ===== AUTOMATION & WORKFLOW =====
app.use('/api/automation-rules', automationRuleRoutes);
app.use('/api/workflow', workflowRoutes);

// ===== COACH DASHBOARD & AUTOMATION =====
app.use('/api/coach-dashboard', coachDashboardRoutes);
// app.use('/api/coach-whatsapp', coachWhatsappRoutes);

// ===== COACH ROUTES (REORGANIZED) =====
// Public coach routes (no auth required)
app.use('/api/coach', dailyPriorityFeedRoutes);
// Protected coach routes (auth required)
app.use('/api/coach-profile', coachRoutes);

// ===== E-COMMERCE & PAYMENTS =====
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));

// ===== MARKETING & ADVERTISING =====
app.use('/api/ads', adsRoutes);
app.use('/api/ai-ads', aiAdsRoutes);

// ===== UNIFIED WHATSAPP INTEGRATION =====
app.use('/api/whatsapp', whatsappRoutes);

// ===== STAFF & TEAM MANAGEMENT =====
app.use('/api/staff', staffRoutes);
app.use('/api/staff-dashboard', staffDashboardRoutes);
app.use('/api/staff-leaderboard', staffLeaderboardRoutes);

// ===== MESSAGE TEMPLATES & ZOOM INTEGRATION =====
app.use('/api/message-templates', require('./routes/messageTemplateRoutes'));
app.use('/api/zoom-integration', require('./routes/zoomIntegrationRoutes'));

// ===== ADVANCED MLM & PERFORMANCE (Unified) =====
app.use('/api/advanced-mlm', advancedMlmRoutes);
app.use('/api/coach-hierarchy', coachHierarchyRoutes);

// ===== UTILITIES & ADMIN =====
app.use('/api/files', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/funnels', webpageRenderRoutes);

// Import new admin routes
const adminRoutes = require('./admin/routes');

// Mount admin auth routes first (login, logout, etc.)
app.use('/api/admin/auth', adminAuthRoutes);

// Protect admin APIs with authentication
app.use('/api/admin/settings', adminAuth, adminSettingsRoutes);
app.use('/api/admin/users', adminAuth, adminUserRoutes);
app.use('/api/admin/domains', customDomainRoutes); // Already imported
app.use('/api/admin/logs', adminAuth, adminLogsRoutes);
app.use('/api/admin/analytics', adminAuth, adminAnalyticsRoutes);

// Mount new unified admin routes
app.use('/api/admin', adminAuth, adminRoutes);

// Serve admin dashboard UI
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
// 🏠 API Documentation Homepage Route
app.use('/', apiDocsRoutes);

app.get('/.well-known/acme-challenge/:token', (req, res) => {
    const keyAuth = sslService.getChallenge(req.params.token);
    if (!keyAuth) return res.status(404).end();
    res.type('text/plain').send(keyAuth);
});

// --- ❌ 404 Not Found Handler (Enhanced with animations) ---
app.use((req, res, next) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Page Not Found</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background-color: #1a202c;
                    color: #e2e8f0;
                    text-align: center;
                    overflow: hidden;
                    position: relative;
                }
                .background-grid {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.5;
                    animation: pan-background 30s linear infinite;
                    z-index: 0;
                }
                .container-404 {
                    background-color: rgba(30, 41, 59, 0.8);
                    backdrop-filter: blur(8px);
                    padding: 4rem 3rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                    max-width: 500px;
                    border: 1px solid #4a5568;
                    animation: fadeIn 0.8s ease-out;
                    z-index: 1;
                }
                h1 {
                    font-size: 6rem;
                    font-weight: 700;
                    color: #4f46e5;
                    margin: 0;
                    letter-spacing: -0.1em;
                    animation: pulsate 2s infinite ease-in-out alternate;
                }
                h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 0.5rem;
                    color: #cbd5e0;
                }
                p {
                    font-size: 1rem;
                    margin-top: 1rem;
                    color: #a0aec0;
                }
                a {
                    display: inline-block;
                    background-color: #4f46e5;
                    color: #ffffff;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    text-decoration: none;
                    font-weight: 600;
                    margin-top: 2rem;
                    transition: all 0.3s ease;
                }
                a:hover {
                    background-color: #4338ca;
                    transform: translateY(-3px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes pulsate {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.05); }
                }
                @keyframes pan-background {
                    0% { background-position: 0 0; }
                    100% { background-position: 400px 400px; }
                }
            </style>
        </head>
        <body>
            <div class="background-grid"></div>
            <div class="container-404">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The URL you requested could not be found on this server. Please check the address or return to the homepage.</p>
                <a href="/">Go to Homepage</a>
            </div>
        </body>
        </html>
    `);
});

// ⚠️ IMPORTANT: Error Handling Middleware (This is commented out as requested)
// app.use(errorHandler);

// 🌍 Define Server Port
const PORT = process.env.PORT || 8080;

// --- Helper function to print API routes in a formatted table ---
function printApiTable(title, routes, baseUrl) {
    const METHOD_WIDTH = 8;
    const PATH_WIDTH = 75;
    const DESC_WIDTH = 45;

    const totalWidth = METHOD_WIDTH + PATH_WIDTH + DESC_WIDTH + 8;
    const hr = '─'.repeat(totalWidth);

    console.log(`\n\n--- ${title.toUpperCase()} ---`);
    console.log(`╭${hr}╮`);
    console.log(`│ ${'Method'.padEnd(METHOD_WIDTH)} │ ${'URL'.padEnd(PATH_WIDTH)} │ ${'Description'.padEnd(DESC_WIDTH)} │`);
    console.log(`├${'─'.repeat(METHOD_WIDTH)}─┼─${'─'.repeat(PATH_WIDTH)}─┼─${'─'.repeat(DESC_WIDTH)}─┤`);

    routes.forEach(route => {
        const fullPath = `${baseUrl}${route.path}`;
        const method = route.method.padEnd(METHOD_WIDTH);
        const path = fullPath.padEnd(PATH_WIDTH);
        const desc = route.desc.padEnd(DESC_WIDTH);
        console.log(`│ ${method} │ ${path} │ ${desc} │`);
    });

    console.log(`╰${hr}╯`);
}
// -----------------------------------------------------------------

/**
 * Initializes the server by connecting to the database and starting the Express app.
 * It also starts all necessary worker processes.
 */
const startServer = async () => {
    try {
        // First, connect to database
        await connectDB();
        
        // Then, initialize all models to ensure they're registered
        const models = require('./schema');
        
        // Now initialize other services
        await init();

        // --- Start all the worker processes here with await ---
        await initRulesEngineWorker();
        await initActionExecutorWorker();
        await initScheduledExecutorWorker();
        await initPaymentProcessorWorker();
        await initNurturingWorker();

        server.listen(PORT, () => {
            console.log(`Local Development Base URL: http://localhost:${PORT}`);

            // --- Start the scheduled task ---
            checkInactiveCoaches.start();
            
            // --- Start Zoom cleanup service ---
            zoomCleanupService.startCleanup(2, 'daily'); // Default: 2 days retention, daily cleanup
            const nextCleanup = zoomCleanupService.getNextCleanupTime();
            if (nextCleanup) {
                // console.log(`[ZoomCleanup] Next cleanup scheduled for: ${nextCleanup.toLocaleString()}`);
            }
        });
    } catch (error) {
        console.error(`\n❌ Server failed to start: ${error.message}\n`);
        process.exit(1);
    }
};

// Import new services for email, SMS, calendar, notification, and AI
const { emailService, smsService, internalNotificationService, aiService } = require('./services/actionExecutorService');

// Initialize Socket.IO dependent services after server starts
const initializeSocketServices = () => {
    try {
        const whatsappManager = require('./services/whatsappManager');
        whatsappManager.setIoInstance(io);
        
        const adminNotificationService = require('./admin/services/adminNotificationService');
        adminNotificationService.setIoInstance(io);
    } catch (error) {
        console.error('Error initializing Socket.IO services:', error.message);
    }
};

// Call initialization after server starts
setTimeout(initializeSocketServices, 1000);

// Initiate the server startup process
startServer();