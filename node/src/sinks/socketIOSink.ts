// src/sinks/socketIOSink.ts

import { Sink } from './sink';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from 'dotenv';

config();

export class SocketIOSink implements Sink {
  private io: SocketIOServer | null = null;

  constructor(private channel: string, private httpServer: HTTPServer) {}

  async initialize(): Promise<void> {
    // Initialize Socket.IO server with CORS settings
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: "*", // Allow all origins for development; restrict in production
        methods: ["GET", "POST"],
        // allowedHeaders: ["my-custom-header"],
        // credentials: true
      }
    });

    // Handle client connections
    this.io.on('connection', (socket) => {
      console.log(`[${this.channel}] Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`[${this.channel}] Client disconnected: ${socket.id}`);
      });
    });

    console.log(`[${this.channel}] Socket.IO sink initialized.`);
  }

  async writeMatch(gameData: any): Promise<void> {
    if (this.io) {
      this.io.emit('match', gameData);
      console.log(`[${this.channel}] Emitted 'match' event via Socket.IO:`, gameData);
    } else {
      console.warn(`[${this.channel}] Socket.IO server not initialized.`);
    }
  }

  async writePlayers(matchId: string, players: any[]): Promise<void> {
    if (this.io) {
      this.io.emit('players', { matchId, players });
      console.log(`[${this.channel}] Emitted 'players' event via Socket.IO.`);
    } else {
      console.warn(`[${this.channel}] Socket.IO server not initialized.`);
    }
  }

  async writeMove(matchId: string, moveNumber: number, fen: string): Promise<void> {
    if (this.io) {
      this.io.emit('move', { matchId, moveNumber, fen });
      console.log(`[${this.channel}] Emitted 'move' event via Socket.IO.`);
    } else {
      console.warn(`[${this.channel}] Socket.IO server not initialized.`);
    }
  }

  async close(): Promise<void> {
    if (this.io) {
      this.io.close();
      this.io = null;
      console.log(`[${this.channel}] Socket.IO server closed.`);
    }
  }
}
