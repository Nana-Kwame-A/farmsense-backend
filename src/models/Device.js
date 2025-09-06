// models/Device.js
const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  hardwareId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastSeen: {type: Date, default: null},
  isConnected: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Device", deviceSchema);