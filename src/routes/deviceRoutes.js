// src/routes/deviceRoutes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.get('/connection-status', deviceController.getConnectionStatus);
router.post('/sensor-data', deviceController.receiveSensorData);

module.exports = router;