
const express = require("express");
const router = express.Router();
const {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");
const { protect, adminOnly } = require("../middleware/authMiddleware");



router.get("/", protect, adminOnly, getAllTeachers);       // GET  all teachers
router.post("/", protect, adminOnly, createTeacher);      // POST create teacher
router.put("/:id", protect, adminOnly, updateTeacher);    // PUT  update teacher
router.delete("/:id", protect, adminOnly, deleteTeacher); // DELETE remove teacher

module.exports = router;
