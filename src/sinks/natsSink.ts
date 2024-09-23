// src/sinks/natsSink.ts

import { Sink } from './sink';
import { connect, NatsConnection, StringCodec } from 'nats';
import { config } from 'dotenv';

config();

export class NATSSink implements Sink {
  private nc: NatsConnection | null = null;
  private sc = StringCodec();

  constructor(private channel: string) {}

  async initialize(): Promise<void> {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';

    try {
      this.nc = await connect({ servers: natsUrl });
      console.log(`[${this.channel}] Connected to NATS at ${natsUrl}.`);
    } catch (error) {
      console.error(`[${this.channel}] Error connecting to NATS:`, error);
      throw error; // Re-throw to let the application handle initialization failures
    }
  }

  async writeMatch(gameData: any): Promise<void> {
    if (!this.nc) {
      console.error(`[${this.channel}] NATS connection is not established.`);
      return;
    }

    const subject = `lichess.${this.channel}.match`;
    const message = JSON.stringify({ t: 'featured', d: gameData });
    this.nc.publish(subject, this.sc.encode(message));
    console.log(`[${this.channel}] Match data published to NATS on subject '${subject}'.`);
  }

  async writePlayers(matchId: string, players: any[]): Promise<void> {
    // Optionally publish player data if needed
  }

  async writeMove(matchId: string, moveNumber: number, fen: string): Promise<void> {
    if (!this.nc) {
      console.error(`[${this.channel}] NATS connection is not established.`);
      return;
    }

    const subject = `lichess.${this.channel}.move`;
    const moveData = { matchId, moveNumber, fen };
    const message = JSON.stringify({ t: 'fen', d: moveData });
    this.nc.publish(subject, this.sc.encode(message));
    console.log(`[${this.channel}] Move data published to NATS on subject '${subject}'.`);
  }

  async close(): Promise<void> {
    if (this.nc) {
      await this.nc.close();
      console.log(`[${this.channel}] Disconnected from NATS.`);
      this.nc = null;
    }
  }
}
