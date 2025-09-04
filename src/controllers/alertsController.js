// src/controllers/alertsController.js
const User = require('../models/User');
const Alert = require('../models/Alerts');

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
        io.to(userId).emit("new-alert", newAlert);
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
        io.to(userId).emit("alerts-cleared");
        res.status(200).json({ message: 'All alerts cleared successfully for user' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};