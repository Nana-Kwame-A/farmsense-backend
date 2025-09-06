// src/controllers/deviceController.js
const SensorData = require("../models/SensorData");
const User = require("../models/User");
const Device = require("../models/Device");

exports.heartbeat = async (req, res) => {
  const { deviceId } = req.params;

  try {
    const device = await Device.findOneAndUpdate(
      { deviceId },
      { lastSeen: new Date() },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json({ message: "Heartbeat received", lastSeen: device.lastSeen });
  } catch (error) {
    console.error("Heartbeat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.heartbeatStatus = async (req, res) => {
  const { deviceId } = req.params;

  try {
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const now = new Date();
    const isConnected =
    // 2 min timeout for demo purposes, adjust as needed
      device.lastSeen && now - device.lastSeen < 2 * 60 * 1000;

    res.json({ isConnected, lastSeen: device.lastSeen });
  } catch (error) {
    console.error("Heartbeat status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.receiveSensorData = async (req, res) => {
  try {
    const { temperature, humidity, nh3, timestamp, deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ message: "deviceId is required" });
    }

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // if timestamp is missing, use server time
    const eventTimestamp = timestamp ? new Date(timestamp * 1000) : new Date();

    const newSensorData = new SensorData({
      temperature,
      humidity,
      nh3,
      timestamp: eventTimestamp,
      userId: device.userId,
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

exports.registerDevice = async (req, res) => {
  try {
    const { userId } = req.params;
    const { deviceId } = req.body;

    if (!deviceId) return res.status(400).json({ message: "deviceId is required" });

    const existing = await Device.findOne({ deviceId });
    if (existing) return res.status(400).json({ message: "Device already registered" });

    const device = await Device.create({ userId, deviceId });
    res.status(201).json(device);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};