 
const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getStudentReport,
} = require("../controllers/attendanceController");
const { protect, teacherOnly } = require("../middleware/authMiddleware");

// POST /api/attendance/mark — only teachers can mark attendance
router.post("/mark", protect, teacherOnly, markAttendance);

// GET /api/attendance — admin + teacher can view (controller filters by role)
router.get("/", protect, getAttendance);

// GET /api/attendance/report/:studentId — detailed report for one student
router.get("/report/:studentId", protect, getStudentReport);

module.exports = router;
