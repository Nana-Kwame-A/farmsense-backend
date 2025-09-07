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
  if (overrideActive) {
    console.log("Manual override is active for user", userId);
  }

  // --- Temperature check ---
  if (temperature > thresholds.temperature) {
    if (!control.lastTempAlert) {
      console.log(
        "Temperature exceeded for user",
        userId,
        "value:",
        temperature
      );
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
        console.log(
          "Manual override active, skipping fan auto-control for temperature."
        );
      }
    } else {
      console.log("Temperature already in alert state, skipping duplicate.");
    }
  } else {
    if (control.lastTempAlert) {
      console.log(
        "Temperature back to normal for user",
        userId,
        "value:",
        temperature
      );
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
      console.log("Humidity exceeded for user", userId, "value:", humidity);
      alerts.push({
        userId,
        timestamp: Date.now(),
        type: "Humidity",
        value: humidity,
        message: `Humidity exceeded threshold`,
        severity: "warning",
      });

      await Controls.findOneAndUpdate({ userId }, { lastHumidityAlert: true });
    } else {
      console.log("Humidity already in alert state, skipping duplicate.");
    }
  } else {
    if (control.lastHumidityAlert) {
      console.log(
        "Humidity back to normal for user",
        userId,
        "value:",
        humidity
      );
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
      console.log("Ammonia exceeded for user", userId, "value:", nh3);
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
        console.log(
          "Manual override active, skipping fan auto-control for ammonia."
        );
      }
    } else {
      console.log("Ammonia already in alert state, skipping duplicate.");
    }
  } else {
    if (control.lastAmmoniaAlert) {
      console.log("Ammonia back to normal for user", userId, "value:", nh3);
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
    console.log("About to save", alerts.length, "alerts for user", userId);
    try {
      await Alert.insertMany(alerts);
      console.log("Emitting alerts to", userId.toString(), alerts);
      io.to(userId.toString()).emit("new-alerts", { userId, alerts });
      console.log("Alerts emitted successfully.");

      // Send push notifications
      const user = await User.findById(userId);
      if (user?.expoPushToken) {
        for (const alert of alerts) {
          console.log("Sending push notification for alert:", alert);
          await sendPushNotification(user.expoPushToken, alert.message);
          console.log("Push notification sent for alert:", alert);
        }
      }
    } catch (err) {
      console.error("Failed to process alerts:", err);
    }
  }
}

module.exports = { checkAndHandleThresholds };
