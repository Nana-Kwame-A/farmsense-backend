// src/models/User.js
const mongoose = require('mongoose');

// Define the User schema
// This schema captures user information such as username, email, and password.
// It also includes a field to indicate whether the user has registered their device.
// The username and email fields are required and must be unique to ensure that each user
// has a distinct identity in the system.
// The password field is also required for authentication purposes.
// The isDeviceRegistered field is a boolean that defaults to false, indicating whether
// the user has linked a device to their account. This can be useful for applications
// that require device management or monitoring.
// The schema can be extended in the future to include more user-related information
// such as profile pictures, roles, or preferences.
const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isDeviceRegistered: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', userSchema);