// ============================================================
// models/Student.js — STUDENT DATABASE SCHEMA
// Defines what a "Student" document looks like in MongoDB.
// Each student is assigned to one teacher.
// ============================================================

const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true, // Each student has a unique roll number
      trim: true,
    },
    className: {
      type: String,
      required: true, // e.g. "Class 10A"
      trim: true,
    },
    // This links the student to a teacher
    // "ref: 'User'" means it stores the ID of a User document
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB ID reference
      ref: "User", // Points to the User collection
      default: null, // Can be unassigned initially
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", StudentSchema);
