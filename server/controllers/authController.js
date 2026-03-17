 
const User = require("../models/User");
const jwt = require("jsonwebtoken");


const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },          
    process.env.JWT_SECRET,   
    { expiresIn: "7d" }      
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


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });


    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

  
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


const getMe = async (req, res) => {
  
  res.json(req.user);
};

module.exports = { register, login, getMe };
