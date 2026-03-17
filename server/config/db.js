// ============================================================
// config/db.js — DATABASE CONNECTION FILE
// This file connects your Node.js app to MongoDB.
// Think of this as dialing a phone number to reach your database.
// ============================================================

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Try to connect to MongoDB using the URL from .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    // If connection fails, show the error and stop the server
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit the program with failure code
  }
};

module.exports = connectDB;
