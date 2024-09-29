// src/sinks/sinkManager.ts

import { Sink } from './sink';

export class SinkManager {
  private sinks: Sink[] = [];

  constructor(sinks: Sink[]) {
    this.sinks = sinks;
  }

  async initializeAll(): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.initialize()));
  }

  async writeMatch(gameData: any): Promise<void> {
    await Promise.allSettled(this.sinks.map((sink) => sink.writeMatch(gameData)))
      .then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error writing match to sink ${this.sinks[index].constructor.name}:`, result.reason);
          }
        });
      });
  }

  async writePlayers(matchId: string, players: any[]): Promise<void> {
    await Promise.allSettled(this.sinks.map((sink) => sink.writePlayers(matchId, players)))
      .then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error writing players to sink ${this.sinks[index].constructor.name}:`, result.reason);
          }
        });
      });
  }

  async writeMove(matchId: string, moveNumber: number, fen: string): Promise<void> {
    await Promise.allSettled(this.sinks.map((sink) => sink.writeMove(matchId, moveNumber, fen)))
      .then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error writing move to sink ${this.sinks[index].constructor.name}:`, result.reason);
          }
        });
      });
  }

  async closeAll(): Promise<void> {
    await Promise.allSettled(this.sinks.map((sink) => sink.close()))
      .then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error closing sink ${this.sinks[index].constructor.name}:`, result.reason);
          }
        });
      });
  }
}
