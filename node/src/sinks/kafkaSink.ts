// kafkaSink.ts

import { Sink } from './sink';
import { Kafka, Producer } from 'kafkajs';
import { config } from 'dotenv';

config();

export class KafkaSink implements Sink {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private channel: string) {
    this.kafka = new Kafka({
      clientId: 'lichess-stream-client',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = this.kafka.producer();
  }

  async initialize(): Promise<void> {
    await this.producer.connect();
    console.log(`[${this.channel}] Connected to Kafka.`);
  }

  async writeMatch(gameData: any): Promise<void> {
    await this.producer.send({
      topic: `lichess-${this.channel}`,
      messages: [{ value: JSON.stringify({ t: 'featured', d: gameData }) }],
    });
    console.log(`[${this.channel}] Match data sent to Kafka.`);
  }

  async writePlayers(matchId: string, players: any[]): Promise<void> {
    // Kafka might not need to handle players separately, so you can leave this empty or implement as needed
  }

  async writeMove(matchId: string, moveNumber: number, fen: string): Promise<void> {
    const moveData = { matchId, moveNumber, fen };
    await this.producer.send({
      topic: `lichess-${this.channel}`,
      messages: [{ value: JSON.stringify({ t: 'fen', d: moveData }) }],
    });
    console.log(`[${this.channel}] Move data sent to Kafka.`);
  }

  async close(): Promise<void> {
    await this.producer.disconnect();
    console.log(`[${this.channel}] Disconnected from Kafka.`);
  }
}
