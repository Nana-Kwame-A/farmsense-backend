const mongoose = require('mongoose');

// Define the BirdConfig schema
const birdConfigSchema = new mongoose.Schema({
  type: { type: String, enum: ['Broiler', 'Layer'] },
  ageInWeeks: { type: Number, min: 0, max: 100 },
});

// Define the Controls schema
const controlsSchema = new mongoose.Schema({
  fanStatus: { type: Boolean, default: false },
  fanAutoMode: { type: Boolean, default: true },
  manualOverrideEndTimestamp: { type: Date, required: false },
  useCustomThresholds: { type: Boolean, default: false },
  birdConfig: { type: birdConfigSchema, required: false, default: null }, // Add this field
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastTempAlert: { type: Boolean, default: false },
  lastHumidityAlert: { type: Boolean, default: false },
  lastAmmoniaAlert: { type: Boolean, default: false },
});

module.exports = mongoose.model('Controls', controlsSchema);