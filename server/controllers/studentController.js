// ============================================================
// controllers/studentController.js — STUDENT MANAGEMENT LOGIC
// Admin can manage all students.
// Teacher can only view their assigned students.
// ============================================================

const Student = require("../models/Student");

// ---------------------------------------------------------------
// GET /api/students — Get students
// Admin gets ALL students; Teacher gets only THEIR students
// ---------------------------------------------------------------
const getAllStudents = async (req, res) => {
  try {
    let students;

    if (req.user.role === "admin") {
      // Admin sees everyone, and we "populate" the teacher's name
      // populate() replaces the assignedTeacher ID with the full User object
      students = await Student.find().populate("assignedTeacher", "name email");
    } else {
      // Teacher only sees students assigned to them
      students = await Student.find({ assignedTeacher: req.user._id });
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ---------------------------------------------------------------
// POST /api/students — Add a new student (Admin only)
// ---------------------------------------------------------------
const createStudent = async (req, res) => {
  try {
    const { name, rollNumber, className, assignedTeacher } = req.body;

    // Check if roll number already exists
    const exists = await Student.findOne({ rollNumber });
    if (exists) {
      return res.status(400).json({ message: "Roll number already exists" });
    }

    const student = await Student.create({
      name,
      rollNumber,
      className,
      assignedTeacher: assignedTeacher || null,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ---------------------------------------------------------------
// PUT /api/students/:id — Update student details (Admin only)
// ---------------------------------------------------------------
const updateStudent = async (req, res) => {
  try {
    const { name, rollNumber, className, assignedTeacher } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.name = name || student.name;
    student.rollNumber = rollNumber || student.rollNumber;
    student.className = className || student.className;
    // Allow setting teacher to null (unassign) or a new teacher
    if (assignedTeacher !== undefined) {
      student.assignedTeacher = assignedTeacher;
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ---------------------------------------------------------------
// DELETE /api/students/:id — Delete a student (Admin only)
// ---------------------------------------------------------------
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.deleteOne();
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { getAllStudents, createStudent, updateStudent, deleteStudent };
