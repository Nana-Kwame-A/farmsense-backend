// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-key'; // It's better to get this from process.env.JWT_SECRET

const Thresholds = require('../models/Thresholds');
const Controls = require('../models/Controls');
const Alert = require('../models/Alerts');

exports.signup = async (req, res) => {
  try {
    console.log('Received signup request with:', req.body);

      const { username, password, email } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
          username,
          password: hashedPassword,
          email
      });

      // Save the new user document
      const savedUser = await newUser.save();

      // Create initial documents for the new user
      const newThresholds = new Thresholds({
          userId: savedUser._id,
          temperature: 30,
          humidity: 70,
          ammonia: 10
      });
      await newThresholds.save();

      const newControls = new Controls({
          userId: savedUser._id,
          fanStatus: false,
          fanAutoMode: true,
          manualOverrideEndTimestamp: null
      });
      await newControls.save();

      // Create an initial welcome alert
      const newAlert = new Alert({
          userId: savedUser._id,
          type: 'Welcome',
          message: 'Welcome to your Farm App! Your account is ready.',
          severity: 'info'
      });
      await newAlert.save();

      // Respond with success message and a token
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
          expiresIn: '1h',
      });

      res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: savedUser._id, username: savedUser.username, email: savedUser.email },
      });

  } catch (error) {
      if (error.code === 11000) {
          return res.status(400).json({ message: 'Username or email already exists' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.signin = async (req, res) => {
  try {
    // Expect a single field that can be either username or email
    const { usernameOrEmail, password } = req.body;

    // Try to find the user by email first, then by username
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token upon successful sign-in
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Signed in successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error during signin', error: error.message });
  }
};

exports.adminSignin = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // *** IMPORTANT: Check if the user has the 'admin' role ***
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not an administrator' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token upon successful admin sign-in
    // Include the role in the token payload
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    // Send back user data including role
    res.status(200).json({ message: 'Signed in as administrator successfully', token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error during admin signin', error: error.message });
  }
};

// const crypto = require('crypto');
// const nodemailer = require('nodemailer');

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     // Set reset token and expiry on user
//     user.resetPasswordToken = hashedToken;
//     user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//     await user.save();
//     // Construct reset URL
//     const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
//     // Send email
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//       }
//     });
//     const mailOptions = {
//       to: user.email,
//       from: process.env.SMTP_USER,
//       subject: 'Password Reset Request',
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//           <h2 style="color: #2c3e50;">Password Reset Request</h2>
//           <p>Hello ${user.username || ''},</p>
//           <p>You recently requested to reset your password for your account. Click the button below to reset it:</p>
//           <p style="text-align: center; margin: 20px 0;">
//             <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
//           </p>
//           <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
//           <p><a href="${resetUrl}">${resetUrl}</a></p>
//           <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
//           <p>Thanks,<br>The Farm App Team</p>
//         </div>
//       `
//     };
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: 'Password reset link sent' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error during password reset', error: error.message });
//   }
// };

// future implementation
exports.forgotPassword = (req, res) => {
  res.status(501).json({ message: 'Forgot password functionality not yet implemented' });
};