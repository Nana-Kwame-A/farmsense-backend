// src/routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertsController');

router.get('/:userId', alertController.getAlerts);
router.post('/:userId', alertController.addAlert);
router.delete('/:userId', alertController.clearAllAlerts);

module.exports = router;