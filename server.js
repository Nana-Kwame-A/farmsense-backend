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
          <ul>
            <li><a href="/api/sensor-data">/api/sensor-data</a></li>
            <li><a href="/api/alerts">/api/alerts</a></li>
            <li><a href="/api/controls">/api/controls</a></li>
            <li><a href="/api/thresholds">/api/thresholds</a></li>
            <li><a href="/api/users">/api/users</a></li>
            <li><a href="/api/device">/api/device</a></li>
            <li><a href="/api/auth">/api/auth</a></li>
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