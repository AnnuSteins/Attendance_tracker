// ============================================================
// seed.js — CREATE YOUR FIRST ADMIN USER
// Run this ONCE after setting up the project:
//   node seed.js
//
// This creates an admin account so you can log in the first time.
// Without this, you'd have no way to log in!
// ============================================================

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists (avoid duplicates)
    const existing = await User.findOne({ email: "admin@school.com" });
    if (existing) {
      console.log("⚠️  Admin already exists. Skipping creation.");
      process.exit(0);
    }

    // Create the admin user
    // The password will be automatically encrypted by the User model
    await User.create({
      name: "Admin User",
      email: "admin@school.com",
      password: "admin123",
      role: "admin",
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:    admin@school.com");
    console.log("🔑 Password: admin123");
    console.log("\n👉 Login with these credentials, then create teachers from the dashboard.");

    process.exit(0); // Exit successfully
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
