// src/models/SensorData.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SensorDataSchema = new Schema({
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  nh3: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
});

module.exports = mongoose.model('SensorData', SensorDataSchema);