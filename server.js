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
  res.status(200).json({ message: 'Welcome to the FarmSense API!' });
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