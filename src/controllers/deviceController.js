// src/controllers/deviceController.js
const SensorData = require("../models/SensorData");
const User = require("../models/User");
const Device = require("../models/Device");
const { checkAndHandleThresholds } = require("../services/alertsService");


exports.heartbeat = async (req, res) => {
  const { hardwareId } = req.params;

  try {
    const device = await Device.findOneAndUpdate(
      { hardwareId },
      { lastSeen: new Date(), isConnected: true },
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
  const { hardwareId } = req.params;

  try {
    const device = await Device.findOne({ hardwareId });
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
    const { temperature, humidity, nh3, timestamp, hardwareId } = req.body;

    if (!hardwareId) {
      return res.status(400).json({ message: "hardwareId is required" });
    }

    const device = await Device.findOne({ hardwareId });
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (!device.userId) {
      return res
        .status(400)
        .json({ message: "Device is not linked to any user" });
    }

    // if timestamp is missing, use server time
    // const eventTimestamp =  new Date();

    const updatedSensorData = await SensorData.findOneAndUpdate(
      { hardwareId: hardwareId},
      {
        $set: { temperature, humidity, nh3, timestamp: Date.now() },
        $setOnInsert: { userId: device.userId, hardwareId: hardwareId },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true } // ✅ update or insert one doc
    );

    // After saving, emit the new data to all connected clients
        req.io.to(device.userId.toString()).emit("new-sensor-data", updatedSensorData);
    
        console.log("Calling checkAndHandleThresholds for userId:", device.userId, "with data:", { temperature, humidity, nh3 });
        //Threshold check + handle fan control + create alerts
        await checkAndHandleThresholds(
          device.userId,
          { temperature, humidity, nh3 },
          req.io
        );

    res.status(200).json({
      message: "Sensor data updated successfully",
      data: updatedSensorData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error saving sensor data",
      error: error.message,
    });
  }
};

exports.registerDevice = async (req, res) => {
  try {
    const { userId } = req.params;
    const { hardwareId } = req.body;

    if (!hardwareId)
      return res.status(400).json({ message: "hardwareId is required" });

    const existing = await Device.findOne({ hardwareId });
    if (existing)
      return res.status(400).json({ message: "Device already registered" });

    const device = await Device.create({ userId, hardwareId });
    res.status(201).json(device);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
