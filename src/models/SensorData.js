// src/models/SensorData.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the SensorData schema
// This schema captures sensor readings such as temperature, humidity, and ammonia (NH3) levels
// It also includes a timestamp for when the data was recorded and a reference to the user it belongs to
// The userId field is a reference to the User model, ensuring that each sensor data entry
// is associated with a specific user in the system.
// This is useful for multi-user applications where sensor data needs to be segregated by user.
// The schema also includes validation to ensure that the required fields are present.
// The timestamp defaults to the current date and time when a new document is created.
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
  deviceId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('SensorData', SensorDataSchema);