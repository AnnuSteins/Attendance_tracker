
const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    
    date: {
      type: Date,
      required: true,
    },
    
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
    
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


AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
