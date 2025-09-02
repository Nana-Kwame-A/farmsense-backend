// src/controllers/alertsController.js
const User = require('../models/User');
const Alert = require('../models/Alerts');

const fetch = require("node-fetch");

async function sendPushNotification(expoPushToken, title, body) {
    if (!expoPushToken) return;
    try {
        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: expoPushToken,
                sound: "default",
                title,
                body,
                data: { type: "alert" },
            }),
        });
    } catch (err) {
        console.error("Error sending push notification:", err);
    }
}

// add a new alert for a user
exports.addAlert = async (req, res) => {
    try {
        const { userId } = req.params;
        const { timestamp, type, value, message, severity } = req.body;

        const newAlert = new Alert({
            userId,
            timestamp,
            type,
            value,
            message,
            severity
        });

        await newAlert.save();
        // // Lookup user and send push notification if token exists
        // const user = await User.findById(userId);
        // if (user?.expoPushToken) {
        //     await sendPushNotification(
        //         user.expoPushToken,
        //         "🚨 New Farm Alert",
        //         message || `Threshold exceeded (${type}: ${value})`
        //     );
        // }
        res.status(201).json({ message: 'Alert added successfully', data: newAlert });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// get alets for a user
exports.getAlerts = async (req, res) => {
    try {
        const { userId } = req.params;
        const alerts = await Alert.find({ userId }).sort({ timestamp: -1 });
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Clear all alerts for a specific user
exports.clearAllAlerts = async (req, res) => {
    try {
        const { userId } = req.params;
        await Alert.deleteMany({ userId });
        res.status(200).json({ message: 'All alerts cleared successfully for user' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};