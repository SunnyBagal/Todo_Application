const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_KEY = process.env.MONGO_KEY;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_KEY);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;