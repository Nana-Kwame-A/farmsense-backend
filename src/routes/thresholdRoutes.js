// src/routes/thresholdsRoutes.js
const express = require('express');
const router = express.Router();
const thresholdsController = require('../controllers/thresholdsController');

// Define routes for thresholds
// These routes handle getting and updating thresholds for a specific user
// The userId is passed as a parameter to identify which user's thresholds are being managed
// The getThresholds route retrieves the current thresholds for a user.
// The updateThresholds route allows updating the thresholds, such as temperature, humidity, and NH3 levels.
// The thresholdsController contains the logic for handling these requests, including validation and database interactions.
// The thresholds settings are stored in the Thresholds model, which is linked to the User model via the userId field.
router.get('/:userId', thresholdsController.getThresholds);
router.patch('/:userId', thresholdsController.updateThresholds); // Changed from POST to PATCH to match frontend

module.exports = router;