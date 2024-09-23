// dataProcessor.ts

import { EventEmitter } from 'events';
import { LichessData, GameData } from '../types/types';

export class DataProcessor extends EventEmitter {
  private moveCounter = 0;
  private currentMatchId: string | null = null; // Use string type

  constructor(private channel: string) {
    super();
  }

  public processData(line: string) {
    try {
      const data: LichessData = JSON.parse(line);

      // Log the parsed data
      console.log(`[${this.channel}] Parsed data:`, data);

      if (data.t === 'featured') {
        const gameData: GameData = data.d;
        gameData.channel = this.channel;

        // Reset state for the new match
        this.currentMatchId = gameData.id; // Assign Lichess match ID
        this.moveCounter = 0;

        this.emit('featured', gameData);
      } else if (data.t === 'fen') {
        this.moveCounter += 1;
        const fen = data.d;

        if (this.currentMatchId) {
          this.emit('fen', {
            matchId: this.currentMatchId,
            moveNumber: this.moveCounter,
            fen,
          });
        } else {
          console.warn(`[${this.channel}] Match ID is null. Cannot process FEN data.`);
        }
      }
    } catch (e) {
      console.error(`[${this.channel}] Error parsing JSON:`, e);
      console.error(`[${this.channel}] Received line:`, line);
      this.emit('error', e);
    }
  }

  public setCurrentMatchId(matchId: string) {
    this.currentMatchId = matchId;
  }
}
