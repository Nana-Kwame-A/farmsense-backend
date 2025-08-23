// server.js
const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import all routes
const sensorDataRoutes = require('./src/routes/sensorDataRoutes');
const alertRoutes = require('./src/routes/alertsRoutes');
const controlRoutes = require('./src/routes/controlsRoutes');
const thresholdRoutes = require('./src/routes/thresholdRoutes');
const userRoutes = require('./src/routes/userRoutes');
const deviceRoutes = require('./src/routes/deviceRoutes');
const authRoutes = require('./src/routes/authRoutes');



const http = require('http'); // Create an HTTP server
const { Server } = require("socket.io"); // Import the Socket.IO server constructor

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;



// Create the HTTP server and attach the Express app
const server = http.createServer(app);

// Create the Socket.IO server and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
  },
});

// Middleware to parse JSON bodies
app.use(express.json());

// Add the Socket.IO instance to the request object so it can be accessed in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Middleware for CORS and body parsing
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>FarmSense API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 2rem;
            color: #333;
          }
          h1 {
            color: #2c3e50;
          }
          .status {
            background: #fff;
            padding: 1rem;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .endpoints ul {
            list-style: none;
            padding: 0;
          }
          .endpoints li {
            margin: 5px 0;
          }
          .endpoints a {
            text-decoration: none;
            color: #3498db;
          }
        </style>
      </head>
      <body>
        <h1>🚜 Welcome to the FarmSense API</h1>
        <div class="status">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <p><strong>Uptime:</strong> ${process.uptime().toFixed(2)} seconds</p>
          <p><strong>Database:</strong> ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}</p>
          <p><strong>Socket.IO:</strong> ${io.engine.clientsCount > 0 ? io.engine.clientsCount + ' clients connected' : 'No active connections'}</p>
        </div>
        <div class="endpoints">
          <h2>🔗 Available Endpoints</h2>

          <h3>📡 Sensor Data</h3>
          <ul>
            <li><a href="/api/sensor-data">GET /api/sensor-data</a> → Retrieve all sensor data</li>
            <li>POST /api/sensor-data → Submit new sensor data</li>
          </ul>

          <h3>🚨 Alerts</h3>
          <ul>
            <li><a href="/api/alerts">GET /api/alerts</a> → Get all alerts</li>
            <li>POST /api/alerts → Create a new alert</li>
          </ul>

          <h3>⚙️ Controls</h3>
          <ul>
            <li><a href="/api/controls">GET /api/controls</a> → Get current control states</li>
            <li>POST /api/controls → Update control settings (e.g., fans, auto mode)</li>
          </ul>

          <h3>📊 Thresholds</h3>
          <ul>
            <li><a href="/api/thresholds">GET /api/thresholds</a> → Retrieve notification thresholds</li>
            <li>POST /api/thresholds → Update thresholds</li>
          </ul>

          <h3>👤 Users</h3>
          <ul>
            <li><a href="/api/users">GET /api/users</a> → Get all users</li>
            <li>GET /api/users/:userId → Get a specific user's profile</li>
            <li>GET /api/users/:userId/dashboard → Get a user dashboard</li>
            <li>GET /api/users/:userId/is-registered → Check if a device is registered</li>
            <li>GET /api/users/:userId/devices → Get all linked devices</li>
            <li>POST /api/users/:userId/link-device → Link a device</li>
            <li>POST /api/users/:userId/unlink-device → Unlink a device</li>
          </ul>

          <h3>🔌 Devices</h3>
          <ul>
            <li><a href="/api/device">GET /api/device</a> → Get all devices</li>
            <li>POST /api/device → Register a new device</li>
          </ul>

          <h3>🔑 Auth</h3>
          <ul>
            <li>POST /api/auth/register → Register a new user</li>
            <li>POST /api/auth/login → Authenticate a user</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.get('/status', (req, res) => {
  res.status(200).json({
    message: 'FarmSense API Status',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime() + ' seconds',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    socketIO: io.engine.clientsCount > 0 ? `${io.engine.clientsCount} clients connected` : 'No active connections',
    endpoints: {
      sensorData: '/api/sensor-data',
      alerts: '/api/alerts',
      controls: '/api/controls',
      thresholds: '/api/thresholds',
      users: '/api/users',
      devices: '/api/device',
      auth: '/api/auth'
    }
  });
});

// Use all API routes
app.use('/api/sensor-data', sensorDataRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/controls', controlRoutes);
app.use('/api/thresholds', thresholdRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/device', deviceRoutes); 
app.use('/api/auth', authRoutes); 


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});