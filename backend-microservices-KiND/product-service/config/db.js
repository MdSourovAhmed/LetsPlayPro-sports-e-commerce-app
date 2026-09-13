const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Product] MongoDB connected');
  } catch (err) {
    console.error('[Product] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
