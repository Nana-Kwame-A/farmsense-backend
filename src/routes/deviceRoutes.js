// src/routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Define routes for device management
// These routes handle checking the connection status of devices and receiving sensor data
// The getConnectionStatus route checks if the device is connected by looking at the latest sensor data
// The receiveSensorData route allows the device to send sensor readings (temperature, humidity, NH3, and timestamp)
// Each route is handled by a corresponding controller function that processes the request and returns a response.
// The deviceController contains the logic for handling these requests, including database interactions and response formatting.
// src/routes/deviceRoutes.js
router.post('/register', deviceController.registerDevice);
router.get('/:hardwareId/controls', deviceController.getDeviceControls);
router.patch('/:hardwareId/controls', deviceController.updateDeviceControls);
router.post('/:hardwareId/heartbeat', deviceController.heartbeat);
router.get('/:hardwareId/heartbeat-status', deviceController.heartbeatStatus);
router.post('/:hardwareId/sensor-data', deviceController.receiveSensorData);
module.exports = router;