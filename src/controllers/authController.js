// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-key'; // It's better to get this from process.env.JWT_SECRET

const Thresholds = require('../models/Thresholds');
const Controls = require('../models/Controls');
const Alert = require('../models/Alerts');

exports.signup = async (req, res) => {
  try {
    console.log('Received signup request with:', req.body);

      const { username, password, email } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
          username,
          password: hashedPassword,
          email
      });

      // Save the new user document
      const savedUser = await newUser.save();

      // **FIXED:** Create initial documents for the new user, now including userId
      const newThresholds = new Thresholds({
          userId: savedUser._id, // Add this line
          temperature: 30, // Default values
          humidity: 70,
          ammonia: 10
      });
      await newThresholds.save();

      const newControls = new Controls({
          userId: savedUser._id, // Add this line
          fanStatus: false, // Default fan off
          fanAutoMode: true,
          manualOverrideEndTimestamp: null
      });
      await newControls.save();

      // Optional: Create an initial welcome alert
      const newAlert = new Alert({
          userId: savedUser._id, // Add this line
          type: 'Welcome',
          message: 'Welcome to your Farm App! Your account is ready.',
          severity: 'info'
      });
      await newAlert.save();

      // Respond with success message and a token
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
          expiresIn: '1h',
      });

      res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: savedUser._id, username: savedUser.username, email: savedUser.email },
      });

  } catch (error) {
      if (error.code === 11000) {
          return res.status(400).json({ message: 'Username or email already exists' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.signin = async (req, res) => {
  try {
    // Expect a single field that can be either username or email
    const { usernameOrEmail, password } = req.body;

    // Try to find the user by email first, then by username
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token upon successful sign-in
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Signed in successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error during signin', error: error.message });
  }
};

exports.forgotPassword = (req, res) => {
  res.status(501).json({ message: 'Forgot password functionality not yet implemented' });
};