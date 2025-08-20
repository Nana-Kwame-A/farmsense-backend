// src/routes/sensorDataRoutes.js
const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/sensorDataController');

router.post('/add', sensorDataController.addSensorData);
router.get('/:userId/latest', sensorDataController.getLatestSensorData);
router.get('/:userId/all', sensorDataController.getAllSensorData);

module.exports = router;