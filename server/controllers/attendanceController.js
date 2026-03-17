
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");


const markAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    // records is an array like: [{studentId: "abc", status: "Present"}, ...]

    if (!date || !records || records.length === 0) {
      return res.status(400).json({ message: "Date and records are required" });
    }


    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0); 

    const results = [];

    // Loop through each student's record and save/update it
    for (const record of records) {
      // findOneAndUpdate with upsert:true means:
      // → If record exists for this student+date → UPDATE it
      // → If not exists → CREATE it
      // This prevents duplicate entries automatically!
    const attendance = await Attendance.findOneAndUpdate(
     {
        student: record.studentId,
       date: attendanceDate,
      },
      {
        student: record.studentId,
        date: attendanceDate,
        status: record.status,
        markedBy: req.user._id,
      },
      {
        upsert: true,             // Create if doesn't exist
        returnDocument: 'after', 
      }
    );
      results.push(attendance);
    }

    res.json({ message: "Attendance marked successfully", count: results.length });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};


const getAttendance = async (req, res) => {
  try {
    const { studentId, date, month, year } = req.query;
    let filter = {};

    // If a specific student is requested
    if (studentId) {
      filter.student = studentId;
    }

    // If a specific date is requested
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      filter.date = d;
    }

    // If filtering by month and year (for monthly reports)
    if (month && year) {
      const startDate = new Date(year, month - 1, 1); // First day of month
      const endDate = new Date(year, month, 0);       // Last day of month
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate }; // Between start and end
    }

    // If teacher is viewing → only show their students' records
    if (req.user.role === "teacher") {
      // Get all student IDs assigned to this teacher
      const myStudents = await Student.find({ assignedTeacher: req.user._id }).select("_id");
      const myStudentIds = myStudents.map((s) => s._id);
      filter.student = { $in: myStudentIds }; 
    }

    // Fetch records and fill in student name and teacher name
    const records = await Attendance.find(filter)
      .populate("student", "name rollNumber className")
      .populate("markedBy", "name")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};


const getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Security: if teacher, make sure this student belongs to them
    if (req.user.role === "teacher") {
      const student = await Student.findOne({
        _id: studentId,
        assignedTeacher: req.user._id,
      });
      if (!student) {
        return res.status(403).json({ message: "Access denied for this student" });
      }
    }

    // Get all attendance records for this student
    const records = await Attendance.find({ student: studentId })
      .populate("student", "name rollNumber className")
      .sort({ date: 1 });

    // Calculate summary statistics
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === "Present").length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays > 0
      ? ((presentDays / totalDays) * 100).toFixed(2)
      : 0;

    res.json({
      records,
      summary: {
        totalDays,
        presentDays,
        absentDays,
        percentage: `${percentage}%`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { markAttendance, getAttendance, getStudentReport };
