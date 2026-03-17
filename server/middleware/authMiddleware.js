// ============================================================
// middleware/authMiddleware.js — SECURITY GUARD FOR YOUR ROUTES
// Middleware runs BETWEEN receiving a request and processing it.
//
// protect()  → checks if the user is logged in (has valid token)
// adminOnly() → checks if the logged-in user is an Admin
// teacherOnly() → checks if the logged-in user is a Teacher
//
// Think of it like a security badge check at a building entrance.
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ---------------------------------------------------------------
// protect — Makes sure the user is logged in
// Every protected route calls this first
// ---------------------------------------------------------------
const protect = async (req, res, next) => {
  let token;

  // JWT token is sent in the request header like:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract just the token part (remove "Bearer ")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using our secret key from .env
      // If token is fake or expired, this throws an error
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in DB using the ID stored in the token
      // .select("-password") means: get everything EXCEPT the password
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Token is valid → continue to the actual route
    } catch (error) {
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// ---------------------------------------------------------------
// adminOnly — Only allows Admin users to proceed
// Always use AFTER protect()
// ---------------------------------------------------------------
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // User is admin → allow
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// ---------------------------------------------------------------
// teacherOnly — Only allows Teacher users to proceed
// Always use AFTER protect()
// ---------------------------------------------------------------
const teacherOnly = (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Teachers only." });
  }
};

module.exports = { protect, adminOnly, teacherOnly };
