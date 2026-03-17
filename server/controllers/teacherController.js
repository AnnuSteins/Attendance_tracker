// ============================================================
// controllers/teacherController.js — TEACHER MANAGEMENT LOGIC
// Only Admins can use these routes.
// CRUD = Create, Read, Update, Delete
// ============================================================

const User = require("../models/User");
const Student = require("../models/Student");

// ---------------------------------------------------------------
// GET /api/teachers — Get list of ALL teachers
// ---------------------------------------------------------------
const getAllTeachers = async (req, res) => {
  try {
    // Find all users where role is "teacher"
    // .select("-password") hides the password field from results
    const teachers = await User.find({ role: "teacher" }).select("-password");
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ---------------------------------------------------------------
// POST /api/teachers — Create a new teacher account
// ---------------------------------------------------------------
const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already in use
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user with role forced to "teacher"
    const teacher = await User.create({ name, email, password, role: "teacher" });

    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ---------------------------------------------------------------
// PUT /api/teachers/:id — Update a teacher's name or email
// :id means the teacher's MongoDB ID is passed in the URL
// ---------------------------------------------------------------
const updateTeacher = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Find the teacher by their ID (from the URL)
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update their details (only if new value is provided)
    teacher.name = name || teacher.name;
    teacher.email = email || teacher.email;
    await teacher.save(); // Save changes to MongoDB

    res.json({ _id: teacher._id, name: teacher.name, email: teacher.email });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ---------------------------------------------------------------
// DELETE /api/teachers/:id — Remove a teacher
// ---------------------------------------------------------------
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Unassign all students linked to this teacher before deleting
    await Student.updateMany(
      { assignedTeacher: req.params.id },
      { assignedTeacher: null }
    );

    await teacher.deleteOne();
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { getAllTeachers, createTeacher, updateTeacher, deleteTeacher };
