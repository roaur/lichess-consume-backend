// src/persistence.ts

import { SinkManager } from '../sinks/sinkManager';
import { Sink } from '../sinks/sink';
import { KafkaSink } from '../sinks/kafkaSink';
import { PostgresSink } from '../sinks/postgresSink';
import { NATSSink } from '../sinks/natsSink'; // Import NATSSink
import { ConsoleSink } from '../sinks/consoleSink';
import { GameData } from '../types/types';
import { config } from 'dotenv';

config();

export class Persistence {
  private sinkManager: SinkManager;

  constructor(private channel: string) {
    const sinks: Sink[] = [];

    const useKafka = process.env.USE_KAFKA === 'true';
    const usePostgres = process.env.USE_POSTGRES === 'true';
    const useNATS = process.env.USE_NATS === 'true'; // Read USE_NATS

    if (useKafka) {
      sinks.push(new KafkaSink(this.channel));
    }

    if (usePostgres) {
      sinks.push(new PostgresSink());
    }

    if (useNATS) {
      sinks.push(new NATSSink(this.channel));
    }

    // If no sinks are enabled, use ConsoleSink
    if (sinks.length === 0) {
      sinks.push(new ConsoleSink(this.channel));
    }

    this.sinkManager = new SinkManager(sinks);
  }

  async initialize(): Promise<void> {
    await this.sinkManager.initializeAll();
  }

  async saveFeatured(gameData: GameData): Promise<string> {
    const matchId: string = gameData.id;
    await this.sinkManager.writeMatch(gameData);
    await this.sinkManager.writePlayers(matchId, gameData.players);
    return matchId;
  }

  async saveFen(matchId: string, moveNumber: number, fen: string): Promise<void> {
    await this.sinkManager.writeMove(matchId, moveNumber, fen);
  }

  async close(): Promise<void> {
    await this.sinkManager.closeAll();
  }
}
