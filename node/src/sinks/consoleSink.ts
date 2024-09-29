// consoleSink.ts

import { Sink } from './sink';

export class ConsoleSink implements Sink {
  constructor(private channel: string) {}

  async initialize(): Promise<void> {
    // No initialization needed
    console.log(`[${this.channel}] ConsoleSink initialized.`);
  }

  async writeMatch(gameData: any): Promise<void> {
    console.log(`[${this.channel}] Match data:`, gameData);
  }

  async writePlayers(matchId: string, players: any[]): Promise<void> {
    console.log(`[${this.channel}] Players data for match ${matchId}:`, players);
  }

  async writeMove(matchId: string, moveNumber: number, fen: string): Promise<void> {
    console.log(`[${this.channel}] Move ${moveNumber} for match ${matchId}:`, fen);
  }

  async close(): Promise<void> {
    // No cleanup needed
    console.log(`[${this.channel}] ConsoleSink closed.`);
  }
}
