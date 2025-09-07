const mongoose = require('mongoose');

// Define the BirdConfig schema
const birdConfigSchema = new mongoose.Schema({
  type: { type: String, enum: ['Broiler', 'Layer'] },
  ageInWeeks: { type: Number, min: 0, max: 100 },
});

// Define the Controls schema
const controlsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fanAutoMode: { type: Boolean, default: true },
  fanStatus: { type: Boolean, default: false },
  manualOverrideEndTimestamp: { type: Date, default: null },
  lastTempAlert: { type: Boolean, default: false },
  lastHumidityAlert: { type: Boolean, default: false },
  lastAmmoniaAlert: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Controls', controlsSchema);