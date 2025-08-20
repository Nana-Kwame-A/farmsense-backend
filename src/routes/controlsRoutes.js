// src/routes/controlsRoutes.js
const express = require('express');
const router = express.Router();
const controlsController = require('../controllers/controlsController');

router.get('/:userId', controlsController.getControls);
// router.post('/:userId', controlsController.addControls);
router.patch('/:userId', controlsController.updateControls);

module.exports = router;