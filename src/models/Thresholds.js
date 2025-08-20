// src/models/Thresholds.js
const mongoose = require('mongoose');

// Define the Thresholds schema
// This schema defines the thresholds for temperature, humidity, and ammonia (NH3) levels
// It includes a reference to the user it belongs to, ensuring that each threshold setting
// is associated with a specific user in the system.
// The userId field is a reference to the User model, allowing for multi-user applications
// where each user can have their own set of thresholds.
// The schema also includes default values for each threshold, which can be customized by the user.
// The thresholds can be updated or retrieved based on the userId.
// This is useful for applications that need to monitor environmental conditions and alert users
// when thresholds are exceeded.
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