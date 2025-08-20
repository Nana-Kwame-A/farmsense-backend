// src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAllUsers); // Route to get all users
router.get("/:userId/is-registered", userController.checkDeviceRegistration);
router.post("/:userId/link-device", userController.linkDevice);
router.post("/:userId/unlink-device", userController.unlinkDevice);
router.get("/:userId/devices", userController.getUserDevices);

module.exports = router;