// src/controllers/deviceController.js
const SensorData = require('../models/SensorData');

exports.getConnectionStatus = async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    if (!latestData) {
      return res.status(200).json({ isConnected: false });
    }

    const now = new Date();
    const lastReadingTime = new Date(latestData.timestamp);
    const fiveMinutes = 5 * 60 * 1000;
    const isConnected = (now.getTime() - lastReadingTime.getTime()) < fiveMinutes;

    res.status(200).json({ isConnected });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.receiveSensorData = async (req, res) => {
  try {
    const { temperature, humidity, nh3, timestamp } = req.body;
    const newSensorData = new SensorData({ temperature, humidity, nh3, timestamp });
    await newSensorData.save();
    res.status(201).json({ message: 'Sensor data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving sensor data', error: error.message });
  }
};