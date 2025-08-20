// src/models/Control.js
const mongoose = require('mongoose');

// Define the Controls schema
const controlsSchema = new mongoose.Schema({
  fanStatus: { type: Boolean, default: false },
  fanAutoMode: { type: Boolean, default: true },
  manualOverrideEndTimestamp: { type: Date, required: false },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true, // Ensure that every control document is linked to a user
  }
});

module.exports = mongoose.model('Controls', controlsSchema);