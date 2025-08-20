// src/controllers/userController.js
const User = require('../models/User');

const SensorData = require('../models/SensorData');
const Thresholds = require('../models/Thresholds');
const Controls = require('../models/Controls');
const Alert = require('../models/Alerts');

// Get user profile by userId
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the URL parameter
    const user = await User.findById(userId).select('-password'); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkDeviceRegistration = async (req, res) => {
  try {
    const { userId } = req.params; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ isRegistered: user.isDeviceRegistered });
  } catch (error) {
    res.status(500).json({ message: 'Error checking device registration', error: error.message });
  }
};

// Link a device to a user
exports.linkDevice = async (req, res) => {
  try {
    const { userId } = req.params; // Changed from firebaseUid
    const user = await User.findOneAndUpdate(
      { _id: userId }, // Use _id to find by MongoDB's ID
      { isDeviceRegistered: true },
      { new: true, upsert: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Device linked successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error during linking', error: error.message });
  }
};


// You'll need to implement these if they don't exist:
exports.unlinkDevice = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { isDeviceRegistered: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Device unlinked successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error during unlinking', error: error.message });
  }
};

exports.getUserDevices = async (req, res) => {
  // This function would typically return details about devices linked to a user.
  // For now, it might just return the isDeviceRegistered status or a list of devices.
  // Since you only have a single `isDeviceRegistered` flag per user in your User model,
  // this might just return that, or if you plan for multiple devices,
  // your User model would need a `devices: []` array.
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Assuming isDeviceRegistered is the main "device" info for now
    res.status(200).json({ isDeviceRegistered: user.isDeviceRegistered, message: 'This endpoint currently only reflects device registration status.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error getting user devices', error: error.message });
  }
};

// Get all users (for admin purposes)
// This function is useful for admin panels or user management interfaces.
// It retrieves all users without sensitive information like passwords.
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error getting all users', error: error.message });
  }
};

// Register a new user
// This function is used for user signup.
exports.registerUser = async (req, res) => {
    try {
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();

      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      res.status(500).json({ message: 'Error during signup', error: error.message });
    }
  };


  // i might delete this
  // Get all dashboard data for a user
exports.getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sensorData = await SensorData.find({ userId });
    const thresholds = await Thresholds.findOne({ userId });
    const controls = await Controls.findOne({ userId });
    const alerts = await Alert.find({ userId }).sort({ timestamp: -1 });

    res.status(200).json({
      user,
      sensorData,
      thresholds,
      controls,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error getting dashboard data', error: error.message });
  }
};