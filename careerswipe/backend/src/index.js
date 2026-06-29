require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for local dev configurations
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'careerswipe-api'
  });
});

// Hook API routes
app.use('/api', apiRoutes);

// Root path handler
app.get('/', (req, res) => {
  res.send('CareerSwipe AI API is running.');
});

const preferredPort = parseInt(process.env.PORT, 10) || 5000;

async function startServer() {
  try {
    // Bootstrap database tables & defaults
    await initDb();
    await listenOnPort(preferredPort);
  } catch (err) {
    console.error("Database bootstrapping failed. Server cannot start:", err);
    process.exit(1);
  }
}

function listenOnPort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port)
      .once('listening', () => {
        console.log(`===============================================`);
        console.log(` CareerSwipe Backend running on Port: ${port} `);
        console.log(` API Endpoint: http://localhost:${port}/api   `);
        console.log(`===============================================`);
        resolve();
      })
      .once('error', async (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
          try {
            await listenOnPort(port + 1);
            resolve();
          } catch (nextErr) {
            reject(nextErr);
          }
        } else {
          reject(err);
        }
      });
  });
}

startServer();
