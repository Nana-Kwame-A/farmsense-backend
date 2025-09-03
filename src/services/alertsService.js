// src/services/alertsService.js
const Thresholds = require("../models/Thresholds");
const Controls = require("../models/Controls");
const Alert = require("../models/Alerts");
const { sendPushNotification } = require("./pushService");
const User = require("../models/User");

async function checkAndHandleThresholds(userId, sensorData, io) {
  const thresholds = await Thresholds.findOne({ userId });
  if (!thresholds) return;

  const { temperature, humidity, nh3 } = sensorData;
  const alerts = [];

  // --- Temperature check ---
  if (temperature > thresholds.temperature) {
    alerts.push({
      userId,
      timestamp: Date.now(),
      type: "Temperature",
      value: temperature,
      message: `Temperature exceeded threshold`,
      severity: "warning",
    });

    // Auto-fan ON
    await Controls.findOneAndUpdate(
      { userId },
      { fanStatus: true, fanAutoMode: true },
      { upsert: true, new: true }
    );

    alerts.push({
      userId,
      timestamp: Date.now(),
      type: "Fan Control",
      value: 1,
      message: "Fan automatically turned ON due to high temperature.",
      severity: "info",
    });
  }

  // --- Humidity check ---
  if (humidity > thresholds.humidity) {
    alerts.push({
      userId,
      timestamp: Date.now(),
      type: "Humidity",
      value: humidity,
      message: `Humidity exceeded threshold`,
      severity: "warning",
    });
  }

  // --- Ammonia check ---
  if (nh3 > thresholds.ammonia) {
    alerts.push({
      userId,
      timestamp: Date.now(),
      type: "Ammonia",
      value: nh3,
      message: `Ammonia exceeded safe level`,
      severity: "danger",
    });

    // Auto-fan ON
    await Controls.findOneAndUpdate(
      { userId },
      { fanStatus: true, fanAutoMode: true },
      { upsert: true, new: true }
    );

    alerts.push({
      userId,
      timestamp: Date.now(),
      type: "Fan Control",
      value: 1,
      message: "Fan automatically turned ON due to high ammonia levels.",
      severity: "info",
    });
  }

  // Save & emit alerts
  if (alerts.length > 0) {
    await Alert.insertMany(alerts);
    io.emit("new-alerts", { userId, alerts });

    const user = await User.findById(userId);
    if (user && user.expoPushToken) {
      for (const alert of alerts) {
        await sendPushNotification(user.expoPushToken, alert.message);
      }
    }
  }
}

module.exports = { checkAndHandleThresholds };
