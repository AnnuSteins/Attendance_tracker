// ============================================================
// models/Attendance.js — ATTENDANCE DATABASE SCHEMA
// Stores one attendance record per student per day.
// The "unique" index prevents duplicate entries for same student + date.
// ============================================================

const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    // Which student this record belongs to
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    // The date of attendance (stored as a Date object)
    date: {
      type: Date,
      required: true,
    },
    // Present = true, Absent = false
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
    // Which teacher marked this attendance
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------
// UNIQUE INDEX: Prevents marking attendance twice for same student on same day
// If you try to insert a duplicate, MongoDB will throw an error.
// ---------------------------------------------------------------
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
