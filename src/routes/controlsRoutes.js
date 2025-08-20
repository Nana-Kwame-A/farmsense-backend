// src/routes/controlsRoutes.js
const express = require('express');
const router = express.Router();
const controlsController = require('../controllers/controlsController');

// Define routes for controls
// These routes handle getting and updating control settings for a specific user
// The userId is passed as a parameter to identify which user's controls are being managed
// The getControls route retrieves the current control settings for a user.
// The updateControls route allows updating the control settings, such as fan status and auto mode.
// The controlsController contains the logic for handling these requests, including validation and database interactions.
// The controls settings are stored in the Controls model, which is linked to the User model via the userId field.
router.get('/:userId', controlsController.getControls);
// router.post('/:userId', controlsController.addControls);
router.patch('/:userId', controlsController.updateControls);

module.exports = router;