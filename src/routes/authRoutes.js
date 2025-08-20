// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define routes for authentication
// These routes handle user signup, signin, and password recovery
// The signup route allows new users to create an account by providing their username, email, and password.
// The signin route allows existing users to log in using their credentials.
// The forgot-password route allows users to initiate a password recovery process by providing their email.
// Each route is handled by a corresponding controller function that processes the request and returns a response.
// The authController contains the logic for handling these requests, including validation, hashing passwords,
// generating JWT tokens, and interacting with the User model to create or authenticate users.
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;