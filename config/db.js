const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/FunnelsEye';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // 👇 prevents 10min idle disconnects
      socketTimeoutMS: 0,             // never timeout due to inactivity
      maxIdleTimeMS: 0,               // disable idle timeout
      heartbeatFrequencyMS: 10000     // ping server every 10s
    });

    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
  }
};

// Debug listeners
mongoose.connection.on("connected", () => console.log("✅ Connected"));
mongoose.connection.on("error", err => console.error("❌ Error:", err));
mongoose.connection.on("disconnected", () => console.warn("⚠️ Disconnected"));

module.exports = { connectDB };
