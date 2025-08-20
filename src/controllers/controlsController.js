// src/controllers/controlsController.js
// ... imports
const User = require('../models/User');
const Controls = require('../models/Controls');

exports.getControls = async (req, res) => {
    try {
        const { userId } = req.params;
        const controls = await Controls.findOne({ userId });
        if (!controls) {
            return res.status(404).json({ message: 'Controls not found for this user' });
        }
        res.status(200).json(controls);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateControls = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedControls = await Controls.findOneAndUpdate(
            { userId },
            req.body,
            { new: true, upsert: true }
        );
        res.status(200).json(updatedControls);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

