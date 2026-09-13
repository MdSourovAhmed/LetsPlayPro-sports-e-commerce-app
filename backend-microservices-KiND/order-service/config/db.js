const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Order] MongoDB connected');
  } catch (err) {
    console.error('[Order] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
