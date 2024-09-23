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
    await Promise.all(this.sinks.map((sink) => sink.writeMatch(gameData)));
  }

  async writePlayers(matchId: string, players: any[]): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.writePlayers(matchId, players)));
  }

  async writeMove(matchId: string, moveNumber: number, fen: string): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.writeMove(matchId, moveNumber, fen)));
  }

  async closeAll(): Promise<void> {
    await Promise.all(this.sinks.map((sink) => sink.close()));
  }
}
