const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/FunnelsEye';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // ✅ modern options
      serverSelectionTimeoutMS: 5000,   // retry in 5s if server is down
      socketTimeoutMS: 45000,           // socket closes after 45s inactivity
      heartbeatFrequencyMS: 10000       // check connection every 10s
    });

    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
  }
};

// Event listeners for debugging
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected, retrying...");
});

module.exports = { connectDB };
