// ============================================================
// routes/teacherRoutes.js — TEACHER CRUD URLS
// All routes here require: logged in (protect) + Admin role (adminOnly)
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All routes below need: valid token + admin role
// We apply protect and adminOnly as middleware on each route

router.get("/", protect, adminOnly, getAllTeachers);       // GET  all teachers
router.post("/", protect, adminOnly, createTeacher);      // POST create teacher
router.put("/:id", protect, adminOnly, updateTeacher);    // PUT  update teacher
router.delete("/:id", protect, adminOnly, deleteTeacher); // DELETE remove teacher

module.exports = router;
