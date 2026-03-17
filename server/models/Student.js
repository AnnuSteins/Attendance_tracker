
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
      unique: true, 
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    documentassignedTeacher: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", StudentSchema);
