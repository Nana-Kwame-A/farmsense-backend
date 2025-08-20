// src/controllers/sensorDataController.js
const SensorData = require("../models/SensorData");
const User = require("../models/User"); // <-- ADD THIS LINE

exports.getLatestSensorData = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the URL parameter

    const latestData = await SensorData.findOne({ userId }).sort({
      timestamp: -1,
    });

    if (!latestData) {
      return res
        .status(404)
        .json({ message: "No sensor data found for this user" });
    }

    res.status(200).json(latestData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addSensorData = async (req, res) => {
  try {
    const { temperature, humidity, nh3, userId } = req.body;

    // The 'User' model is now correctly defined
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

    console.log("Emitting new-sensor-data:", newSensorData);

    // After saving, emit the new data to all connected clients
    req.io.emit("new-sensor-data", newSensorData);

    res
      .status(201)
      .json({ message: "Sensor data added successfully", data: newSensorData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllSensorData = async (req, res) => {
  try {
    const allData = await SensorData.find({});

    res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
