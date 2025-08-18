const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/FunnelsEye';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      // Connection pool settings
      maxPoolSize: 10,          // adjust as needed
      socketTimeoutMS: 0,       // never time out sockets
      connectTimeoutMS: 30000,  // 30s connection timeout
      serverSelectionTimeoutMS: 30000,
    });

    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.error('⚠️ Mongoose disconnected, retrying...');
    connectDB(); // auto-reconnect
  });
};

module.exports = { connectDB };
