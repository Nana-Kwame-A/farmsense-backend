// src/controllers/sensorDataController.js
const SensorData = require("../models/SensorData");
const User = require("../models/User");
const Threshods = require("../models/Thresholds");
const Alert = require("../models/Alert");
const { checkAndHandleThresholds } = require("../services/alertsService");

// Get the latest sensor data for a user
exports.getLatestSensorData = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the URL parameter

    const latestData = await SensorData.findOne({ userId }).sort({
      timestamp: -1,
    });

    if (!latest) {
      return res.json({
        temperature: null,
        humidity: null,
        nh3: null,
        timestamp: null,
      });
    }

    return res.json(latest);

    res.status(200).json(latestData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new sensor data for a user
// This function assumes that the request body contains userId and sensor data fields
exports.addSensorData = async (req, res) => {
  try {
    const { temperature, humidity, nh3, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newSensorData = new SensorData({
      temperature,
      humidity,
      nh3,
      userId,
    });
    await newSensorData.save();

    // After saving, emit the new data to all connected clients
    req.io.emit("new-sensor-data", newSensorData);

    //Threshold check + handle fan control + create alerts
    await checkAndHandleThresholds(userId, { temperature, humidity, nh3 }, req.io);

    
    res
      .status(201)
      .json({ message: "Sensor data added successfully", data: newSensorData });
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
