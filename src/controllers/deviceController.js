// src/controllers/deviceController.js
const SensorData = require("../models/SensorData");
const User = require("../models/User");

exports.heartbeat = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    res.status(200).json({ message: "Heartbeat received" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.heartbeatStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ if userId is missing
    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    const user = await User.findById(userId);
    if (!user || !user.lastSeen) {
      return res.status(200).json({ isConnected: false });
    }
    const now = new Date();
    const lastSeen = new Date(user.lastSeen).getTime();

    const isConnected = now - lastSeen < 2 * 60 * 1000; // 2 minutes threshold

    return res.status(200).json({ isConnected });
  } catch (error) {
    console.error("getConnectionStatus error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.receiveSensorData = async (req, res) => {
  try {
    const { temperature, humidity, nh3, timestamp, userId } = req.body;

    // if timestamp is missing, use server time
    const eventTimestamp = timestamp ? new Date(timestamp * 1000) : new Date();

    const newSensorData = new SensorData({
      temperature,
      humidity,
      nh3,
      timestamp: eventTimestamp,
      userId,
    });
    await newSensorData.save();
    res.status(201).json({ message: "Sensor data saved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error saving sensor data",
        error: error.message,
      });
  }
};
