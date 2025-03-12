// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password // Password will be hashed using a pre-save hook in the User model
    });

    // Save user to database
    await user.save();

    // Generate JWT
    const token = generateToken(user);

    // Send token to client
    res.status(201).json({
      msg: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user);

    // Send token to client
    res.json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', async (req, res) => {
  try {
    // Verify token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(403).json({ msg: 'Invalid or expired token' });
  }
});

// @route   POST api/auth/logout
// @desc    Logout user (no session to destroy)
// @access  Private
router.post('/logout', (req, res) => {
  res.json({ msg: 'Logged out successfully' });
});

module.exports = router;