// src/controllers/thresholdsController.js
// ... imports
const User = require('../models/User');
const Thresholds = require('../models/Thresholds');

exports.getThresholds = async (req, res) => {
    try {
        const { userId } = req.params;
        const thresholds = await Thresholds.findOne({ userId });
        if (!thresholds) {
            return res.status(404).json({ message: 'Thresholds not found for this user' });
        }
        res.status(200).json(thresholds);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateThresholds = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedThresholds = await Thresholds.findOneAndUpdate(
            { userId },
            req.body,
            { new: true, upsert: true } // upsert creates a new document if none exists
        );
        res.status(200).json(updatedThresholds);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};