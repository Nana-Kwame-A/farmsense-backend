// src/routes/thresholdsRoutes.js
const express = require('express');
const router = express.Router();
const thresholdsController = require('../controllers/thresholdsController');

router.get('/:userId', thresholdsController.getThresholds);
router.post('/:userId', thresholdsController.updateThresholds); // You may need a controller for this if it doesn't exist

module.exports = router;