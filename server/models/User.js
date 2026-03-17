// ============================================================
// models/User.js — USER DATABASE SCHEMA
// A "model" is a blueprint for how data is stored in MongoDB.
// This file defines what a "User" looks like in the database.
// A User can be either an Admin or a Teacher.
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For encrypting passwords

// Define the shape of a User document in MongoDB
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // This field MUST be provided
      trim: true,     // Remove extra spaces automatically
    },
    email: {
      type: String,
      required: true,
      unique: true,   // No two users can have the same email
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teacher"], // Role can ONLY be one of these two
      default: "teacher",         // Default role is teacher
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ---------------------------------------------------------------
// MIDDLEWARE: Before saving a user, automatically encrypt password
// "pre('save')" means: run this function BEFORE saving to database
// ---------------------------------------------------------------
// NEW CODE — works with Mongoose v7+
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// ---------------------------------------------------------------
// METHOD: Compare entered password with stored encrypted password
// Used during login to check if password is correct
// ---------------------------------------------------------------
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model so other files can use it
module.exports = mongoose.model("User", UserSchema);
