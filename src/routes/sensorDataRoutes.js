// src/routes/sensorDataRoutes.js
const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/sensorDataController');

// Define routes for sensor data management
// These routes handle adding new sensor data and retrieving sensor data for a specific user
// The addSensorData route allows devices to send sensor readings (temperature, humidity, NH3, and timestamp).
// The getLatestSensorData route retrieves the most recent sensor data for a user.
// The getAllSensorData route retrieves all sensor data for a user, which can be useful for
// historical analysis or monitoring trends over time.
router.patch('/add', sensorDataController.addSensorData);
router.get('/:userId/latest', sensorDataController.getLatestSensorData);
router.get('/:userId/all', sensorDataController.getAllSensorData);

module.exports = router;