// ============================================================
// controllers/authController.js — LOGIN & REGISTER LOGIC
// Controllers contain the actual business logic.
// Routes just define the URL; controllers do the work.
// ============================================================

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ---------------------------------------------------------------
// Helper: Generate a JWT token for a user
// JWT = JSON Web Token — like a digital ID card with an expiry date
// It stores the user's ID and is sent to the frontend after login
// ---------------------------------------------------------------
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // Payload: what we store inside the token
    process.env.JWT_SECRET,   // Secret key to sign/verify the token
    { expiresIn: "7d" }       // Token expires after 7 days
  );
};

// ---------------------------------------------------------------
// POST /api/auth/register
// Creates a new user account (Admin or Teacher)
// ---------------------------------------------------------------
const register = async (req, res) => {
  try {
    // Get the data sent from the frontend form
    const { name, email, password, role } = req.body;

    // Check if a user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create the new user in MongoDB
    // Password is automatically encrypted by the model's pre-save hook
    const user = await User.create({ name, email, password, role });

    // Send back the user info + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ---------------------------------------------------------------
// POST /api/auth/login
// Checks email + password, returns token if correct
// ---------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If no user found OR password doesn't match → reject
    // user.matchPassword() is the method we defined in the User model
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Login successful → send back user info + JWT token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ---------------------------------------------------------------
// GET /api/auth/me
// Returns the currently logged-in user's info
// ---------------------------------------------------------------
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.json(req.user);
};

module.exports = { register, login, getMe };
