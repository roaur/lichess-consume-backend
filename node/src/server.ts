// src/server.ts

import express from 'express';
import { createServer } from 'http';
import { Persistence } from './data/persistence';
import { config } from 'dotenv';
import { SocketIOSink } from './sinks/socketIOSink';

config();

const app = express();
const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3000;

// Create an HTTP server
const httpServer = createServer(app);

// Initialize SocketIOSink
const channel = 'blitz'; // or dynamic based on your application
const socketIOSink = new SocketIOSink(channel, httpServer);

// Initialize Persistence and SinkManager, adding SocketIOSink
const persistence = new Persistence(channel);

(async () => {
  try {
    // Initialize Persistence (which initializes all sinks)
    await persistence.initialize();

    // Set up Express routes
    app.get('/', (req, res) => {
      res.send('Socket.IO Server is running.');
    });

    // Start listening
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`Express and Socket.IO server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize Persistence and Sinks:', error);
    process.exit(1);
  }
})();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await persistence.close();
  process.exit(0);
});
