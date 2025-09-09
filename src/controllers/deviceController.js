// src/controllers/deviceController.js
const SensorData = require("../models/SensorData");
const User = require("../models/User");
const Device = require("../models/Device");
const { checkAndHandleThresholds } = require("../services/alertsService");
const Controls = require("../models/Controls");

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
      { hardwareId: hardwareId },
      {
        $set: { temperature, humidity, nh3, timestamp: Date.now() },
        $setOnInsert: { userId: device.userId, hardwareId: hardwareId },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true } // ✅ update or insert one doc
    );

    // After saving, emit the new data to all connected clients
    req.io
      .to(device.userId.toString())
      .emit("new-sensor-data", updatedSensorData);

    console.log(
      "Calling checkAndHandleThresholds for userId:",
      device.userId,
      "with data:",
      { temperature, humidity, nh3 }
    );
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

// Get controls for a device by hardwareId
exports.getDeviceControls = async (req, res) => {
  try {
    const { hardwareId } = req.params;

    const device = await Device.findOne({ hardwareId }).populate("userId");
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    let controls = await Controls.findOne({ userId: device.userId._id });

    if (!controls) {
      controls = new Controls({
        userId: device.userId._id,
        fanAutoMode: true,
        fanStatus: false,
        manualOverrideEndTimestamp: null,
      });
      await controls.save();
    }

    // ✅ FIXED: Handle manual override expiration
    const now = Date.now();
    if (
      !controls.fanAutoMode &&
      controls.manualOverrideEndTimestamp &&
      now > controls.manualOverrideEndTimestamp
    ) {
      // Manual override expired, return to auto mode
      controls.fanAutoMode = true;
      controls.fanStatus = false;
      controls.manualOverrideEndTimestamp = null;
      await controls.save();

      console.log(
        `Manual override expired for device ${hardwareId}, returning to auto mode`
      );
    }
    // ✅ FIXED: Return numeric timestamp
    res.status(200).json({
      fanAutoMode: controls.fanAutoMode,
      fanStatus: controls.fanStatus,
      manualOverrideEndTimestamp: controls.manualOverrideEndTimestamp, // Now a number or null
    });
  } catch (error) {
    console.error("Error getting device controls:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ NEW: Update device controls function
exports.updateDeviceControls = async (req, res) => {
  try {
    const { hardwareId } = req.params;
    const { fanAutoMode, fanStatus, manualOverrideDuration = 30 } = req.body; // Default 30 minutes

    const device = await Device.findOne({ hardwareId }).populate("userId");
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    let controls = await Controls.findOne({ userId: device.userId._id });
    if (!controls) {
      controls = new Controls({ userId: device.userId._id });
    }

    // ✅ LOGIC: Handle different control scenarios
    if (fanAutoMode === false) {
      // Manual mode activated
      controls.fanAutoMode = false;
      controls.fanStatus = fanStatus;
      controls.manualOverrideEndTimestamp =
        Date.now() + manualOverrideDuration * 60 * 1000;

      console.log(
        `Manual override set for device ${hardwareId}: Fan ${
          fanStatus ? "ON" : "OFF"
        } for ${manualOverrideDuration} minutes`
      );
    } else {
      // Auto mode activated
      controls.fanAutoMode = true;
      controls.fanStatus = false; // Auto mode determines fan status
      controls.manualOverrideEndTimestamp = null;

      console.log(`Auto mode activated for device ${hardwareId}`);
    }

    await controls.save();

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("controlsUpdated", {
        deviceId: device._id,
        hardwareId: hardwareId,
        controls: {
          fanAutoMode: controls.fanAutoMode,
          fanStatus: controls.fanStatus,
          manualOverrideEndTimestamp: controls.manualOverrideEndTimestamp,
        },
      });
    }
    res.status(200).json({
      fanAutoMode: controls.fanAutoMode,
      fanStatus: controls.fanStatus,
      manualOverrideEndTimestamp: controls.manualOverrideEndTimestamp,
    });
  } catch (error) {
    console.error("Error updating device controls:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
