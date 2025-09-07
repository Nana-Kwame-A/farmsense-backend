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


// Get all dashboard data for a user (refactored for deviceId-based system)
const Device = require('../models/Device');
const { default: mongoose } = require('mongoose');
exports.getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all devices linked to the user
    const devices = await Device.find({ userId });
    const deviceIds = devices.map(device => device.deviceId || device._id);

    // Fetch all sensor data, thresholds, controls, and alerts for the user's devices
    const sensorData = await SensorData.find({ deviceId: { $in: deviceIds } });
    const thresholds = await Thresholds.find({ deviceId: { $in: deviceIds } });
    const controls = await Controls.find({ deviceId: { $in: deviceIds } });
    const alerts = await Alert.find({ deviceId: { $in: deviceIds } }).sort({ timestamp: -1 });

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
// Check if a device is registered for a user
exports.checkDeviceRegistration = async (req, res) => {
  try {
    const { userId } = req.params;

    const device = await Device.findOne({ userId });
    res.status(200).json({ isRegistered: !!device });
  } catch (error) {
    res.status(500).json({ message: "Server error checking device registration", error: error.message });
  }
};

// Get all devices for a user
exports.getUserDevices = async (req, res) => {
  try {
    const { userId } = req.params;
    const devices = await Device.find({ userId });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: "Server error getting user devices", error: error.message });
  }
};

// Link a device to a user (idempotent)
exports.linkDevice = async (req, res) => {
  try {
    const { userId } = req.params;
    const { hardwareId } = req.body;

    let device = await Device.findOne({ hardwareId });

    if (device) {
      if (device.userId.toString() === userId) {
        return res.status(200).json({ message: "Device already linked to this user", device });
      }
      return res.status(400).json({ message: "Device already linked to another user" });
    }

    device = new Device({ userId: new mongoose.Types.ObjectId(userId), hardwareId });
    await device.save();

    res.status(201).json({ message: "Device linked successfully", device });
  } catch (error) {
    console.log("Error linking device:", error);
    res.status(500).json({ message: "Server error linking device", error: error.message });
  }
};

// Unlink a device from a user
exports.unlinkDevice = async (req, res) => {
  try {
    const { userId } = req.params;
    const { deviceId } = req.body;

    const device = await Device.findOneAndDelete({ userId, deviceId });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ message: "Device unlinked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error unlinking device", error: error.message });
  }
};