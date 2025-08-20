// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Define routes for user management
// These routes handle user-related operations such as checking device registration,
// linking and unlinking devices, and retrieving user devices.
// The userId is passed as a parameter to identify which user's operations are being managed.
// The getAllUsers route retrieves all users in the system, which can be useful for administrative
// purposes or monitoring.
// The checkDeviceRegistration route checks if a device is registered for a specific user.
// The linkDevice route allows linking a device to a user, which may involve updating the user's
// device information in the database.
// The unlinkDevice route allows unlinking a device from a user, which may involve removing the
// device information from the user's profile.
// The getUserDevices route retrieves all devices associated with a specific user, which can be useful
// for monitoring or managing user devices.
// More specific routes should come first to be matched exactly
// The order is crucial!

router.get("/:userId/dashboard", userController.getUserDashboard);
router.get("/:userId/is-registered", userController.checkDeviceRegistration);
router.get("/:userId/devices", userController.getUserDevices);
router.post("/:userId/link-device", userController.linkDevice);
router.post("/:userId/unlink-device", userController.unlinkDevice);

// More general routes come after specific ones
router.get("/:userId", userController.getUserProfile); // Get a specific user's profile by ID
router.get("/", userController.getAllUsers); // Get all users


module.exports = router;