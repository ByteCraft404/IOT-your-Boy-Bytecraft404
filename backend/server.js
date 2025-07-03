import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import dataRoutes from './routes/dataRoutes.js';
import ledRoutes from './routes/ledRoutes.js';
import controlRoutes from './routes/controlRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { initializeSocket } from './websocket/sensorSocket.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors());


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize WebSocket
initializeSocket(io);

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/data', dataRoutes);
app.use('/api/led', ledRoutes);
app.use('/api/control', controlRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AgriPulse Backend is running',
    timestamp: new Date().toISOString()
  });
});


// Root deployment confirmation route
app.get('/', (req, res) => {
  res.send(' AgriPulse Backend is deployed and running!');
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌱 AgriPulse Backend running on port ${PORT}`);
  console.log(`🔗 WebSocket enabled for real-time updates`);
});
