require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 4444,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye',
    MAIN_APP_URL: process.env.MAIN_APP_URL || 'http://localhost:8080',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
