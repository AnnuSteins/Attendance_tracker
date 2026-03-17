// ============================================================
// server.js — THE MAIN FILE THAT STARTS YOUR ENTIRE BACKEND
// Think of this as the "reception desk" of your application.
// Every request comes here first, then gets sent to the right room.
// ============================================================

// 1. Load secret settings from .env file
require("dotenv").config();

// 2. Import express (the framework that creates our server)
const express = require("express");

// 3. Import cors — this lets our frontend (HTML pages) talk to this backend
const cors = require("cors");

// 4. Import our database connection function
const connectDB = require("./config/db");

// 5. Import all our route files (each file handles one topic)
const authRoutes = require("./routes/authRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

// 6. Create the express app
const app = express();

// 7. Connect to MongoDB database
connectDB();

// 8. Middleware — these run on EVERY request before it reaches routes
app.use(cors()); // Allow frontend to contact backend
app.use(express.json()); // Allow reading JSON data from requests

// 9. Tell Express which URL paths go to which route files
// Example: a request to /api/auth/login → goes to authRoutes
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

// 10. A simple test route — visit http://localhost:5000/ to check if server works
app.get("/", (req, res) => {
  res.json({ message: "Attendance Tracker Server is running!" });
});

// 11. Start listening for requests on the port from .env (5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
