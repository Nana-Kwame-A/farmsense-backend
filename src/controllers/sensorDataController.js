// src/controllers/sensorDataController.js
const SensorData = require("../models/SensorData");
const User = require("../models/User");
const { checkAndHandleThresholds } = require("../services/alertsService");
const Device = require("../models/Device");

// Get the latest sensor data for a user or device
exports.getLatestSensorData = async (req, res) => {
  try {
    const { userId, deviceId } = req.params; // Get userId or deviceId from the URL parameter

    let query = {};
    if (deviceId) {
      query.deviceId = deviceId;
    } else if (userId) {
      query.userId = userId;
    } else {
      return res.status(400).json({ message: "Either userId or deviceId must be provided" });
    }

    const latestData = await SensorData.findOne(query).sort({
      timestamp: -1,
    });

    if (!latestData) {
      return res.json({
        temperature: null,
        humidity: null,
        nh3: null,
        timestamp: null,
      });
    }

    return res.json(latestData);

    res.status(200).json(latestData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new sensor data for a device
// This function assumes that the request body contains deviceId and sensor data fields
exports.addSensorData = async (req, res) => {
  try {
    const { temperature, humidity, nh3, deviceId } = req.body;

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const userId = device.userId;

    const data = await SensorData.findOneAndUpdate(
      { deviceId },
      { temperature, humidity, nh3, userId, deviceId, timestamp: Date.now() },
      { new: true, upsert: true } // create if doesn't exist
    );

    const newSensorData = data;

    // After saving, emit the new data to all connected clients
    req.io.to(userId.toString()).emit("new-sensor-data", newSensorData);

    //Threshold check + handle fan control + create alerts
    await checkAndHandleThresholds(
      userId,
      { temperature, humidity, nh3 },
      req.io
    );

    res
      .status(200)
      .json({
        message: "Sensor data updated successfully",
        data: newSensorData,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all sensor data for a user
exports.getAllSensorData = async (req, res) => {
  try {
    const allData = await SensorData.find({});

    res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
