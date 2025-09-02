// src/controllers/deviceController.js
const SensorData = require('../models/SensorData');
const User = require('../models/User');


exports.getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ if userId is missing
    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    const latestData = await SensorData.findOne({ userId }).sort({ timestamp: -1 });

    // ✅ if no sensor data exists for this user
    if (!latestData) {
      return res.status(200).json({ isConnected: false });
    }

    const now = new Date();
    const lastReadingTime = new Date(latestData.timestamp);
    const fiveMinutes = 5 * 60 * 1000;
    const isConnected = (now.getTime() - lastReadingTime.getTime()) < fiveMinutes;

    return res.status(200).json({ isConnected });
  } catch (error) {
    console.error("getConnectionStatus error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.receiveSensorData = async (req, res) => {
  try {
    const { temperature, humidity, nh3, timestamp, userId } = req.body;
    const newSensorData = new SensorData({ temperature, humidity, nh3, timestamp, userId });
    await newSensorData.save();
    res.status(201).json({ message: 'Sensor data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving sensor data', error: error.message });
  }
};