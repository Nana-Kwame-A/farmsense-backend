// src/routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertsController');

// Define routes for alerts
// These routes handle adding, retrieving, and clearing alerts for a specific user
// The userId is passed as a parameter to identify which user's alerts are being managed
// The addAlert route allows adding a new alert with details like timestamp, type, value,
// message, and severity. The getAlerts route retrieves all alerts for a user, sorted by
// timestamp in descending order. The clearAllAlerts route deletes all alerts for a user.
router.get('/:userId', alertController.getAlerts);
router.post('/:userId', alertController.addAlert);
router.delete('/:userId', alertController.clearAllAlerts);

module.exports = router;