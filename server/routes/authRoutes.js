// ============================================================
// routes/authRoutes.js — AUTH URL DEFINITIONS
// Routes just map HTTP method + URL → controller function.
// Think of routes as a menu in a restaurant.
// The controller is the kitchen that actually prepares the food.
// ============================================================

const express = require("express");
const router = express.Router(); // Create a mini-router
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register → create a new user
router.post("/register", register);

// POST /api/auth/login → login and get token
router.post("/login", login);

// GET /api/auth/me → get my own profile (must be logged in)
router.get("/me", protect, getMe);
// Note: protect is middleware that runs BEFORE getMe
// It checks the token first, then calls getMe

module.exports = router;
