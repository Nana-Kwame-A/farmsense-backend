// src/models/Thresholds.js
const mongoose = require('mongoose');

const thresholdsSchema = new mongoose.Schema({
  temperature: { type: Number, default: 35 },
  humidity: { type: Number, default: 70 },
  ammonia: { type: Number, default: 20 },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true, // Ensure that every threshold document is linked to a user
  }
});

module.exports = mongoose.model('Thresholds', thresholdsSchema);