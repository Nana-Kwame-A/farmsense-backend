// src/services/alertsService.js
const Thresholds = require("../models/Thresholds");
const Controls = require("../models/Controls");
const Alert = require("../models/Alerts");
const { sendPushNotification } = require("./pushService");
const User = require("../models/User");
const e = require("cors");

async function checkAndHandleThresholds(userId, sensorData, io) {
  const thresholds = await Thresholds.findOne({ userId });
  if (!thresholds) return;

  const { temperature, humidity, nh3 } = sensorData;
  const alerts = [];

  // Load last states
  let control = await Controls.findOne({ userId });
  if (!control) {
    control = await Controls.create({
      userId,
      lastTempAlert: false,
      lastHumidityAlert: false,
      lastAmmoniaAlert: false,
    });
  }

  const overrideActive =
    control.manualOverrideEndTimestamp &&
    control.manualOverrideEndTimestamp > Date.now();

  // --- Temperature check ---
  if (temperature > thresholds.temperature) {
    if (!control.lastTempAlert) {
      alerts.push({
        userId,
        timestamp: Date.now(),
        type: "Temperature",
        value: temperature,
        message: `Temperature exceeded threshold`,
        severity: "warning",
      });

      if (!overrideActive) {
        await Controls.findOneAndUpdate(
          { userId },
          { lastTempAlert: true, fanStatus: true, fanAutoMode: true }
        );

        alerts.push({
          userId,
          timestamp: Date.now(),
          type: "Fan Control",
          value: 1,
          message: "Fan automatically turned ON due to high temperature.",
          severity: "info",
        });
      } else {
        await Controls.findOneAndUpdate({ userId }, { lastTempAlert: true });
        console.log("Manual override active, skipping fan auto-control.");
      }
    }
  } else {
    if (control.lastTempAlert) {
      alerts.push({
        userId,
        timestamp: Date.now(),
        type: "Temperature",
        value: temperature,
        message: `Temperature back to normal`,
        severity: "info",
      });

      await Controls.findOneAndUpdate({ userId }, { lastTempAlert: false });
    }
  }

  // --- Humidity check ---
  if (humidity > thresholds.humidity) {
    if (!control.lastHumidityAlert) {
      alerts.push({
        userId,
        timestamp: Date.now(),
        type: "Humidity",
        value: humidity,
        message: `Humidity exceeded threshold`,
        severity: "warning",
      });

      await Controls.findOneAndUpdate({ userId }, { lastHumidityAlert: true });
    }
  } else {
    if (control.lastHumidityAlert) {
      alerts.push({
        userId,
        timestamp: Date.now(),
        type: "Humidity",
        value: humidity,
        message: `Humidity back to normal`,
        severity: "info",
      });

      await Controls.findOneAndUpdate({ userId }, { lastHumidityAlert: false });
    }
  }

  // --- Ammonia check ---
  if (nh3 > thresholds.ammonia) {
    if (!control.lastAmmoniaAlert) {
      alerts.push({
        userId,
        timestamp: Date.now(),
        type: "Ammonia",
        value: nh3,
        message: `Ammonia exceeded safe level`,
        severity: "danger",
      });

      if (!overrideActive) {
        await Controls.findOneAndUpdate(
          { userId },
          { lastAmmoniaAlert: true, fanStatus: true, fanAutoMode: true }
        );

        alerts.push({
          userId,
          timestamp: Date.now(),
          type: "Fan Control",
          value: 1,
          message: "Fan automatically turned ON due to high ammonia levels.",
          severity: "info",
        });
      } else {
        await Controls.findOneAndUpdate({ userId }, { lastAmmoniaAlert: true });
        console.log("Manual override active, skipping fan auto-control.");
      }
    }
  } else {
    if (control.lastAmmoniaAlert) {
      alerts.push({
        userId,
        timestamp: Date.now(),
        type: "Ammonia",
        value: nh3,
        message: `Ammonia back to normal`,
        severity: "info",
      });

      await Controls.findOneAndUpdate({ userId }, { lastAmmoniaAlert: false });
    }
  }

  // Save & emit alerts
  if (alerts.length > 0) {
    try {
      await Alert.insertMany(alerts);
      io.to(userId).emit("new-alerts", { userId, alerts });

      const user = await User.findById(userId);
      if (user?.expoPushToken) {
        for (const alert of alerts) {
          await sendPushNotification(user.expoPushToken, alert.message);
        }
      }
    } catch (err) {
      console.error("Failed to process alerts:", err);
    }
  }
}

module.exports = { checkAndHandleThresholds };
