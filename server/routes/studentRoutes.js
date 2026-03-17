
const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getAllStudents);                  // Admin + Teacher
router.post("/", protect, adminOnly, createStudent);      // Admin only
router.put("/:id", protect, adminOnly, updateStudent);    // Admin only
router.delete("/:id", protect, adminOnly, deleteStudent); // Admin only

module.exports = router;
