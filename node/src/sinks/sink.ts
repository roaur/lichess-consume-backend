// sink.ts

export interface Sink {
    initialize(): Promise<void>;
    writeMatch(gameData: any): Promise<void>;
    writePlayers(matchId: string, players: any[]): Promise<void>;
    writeMove(matchId: string, moveNumber: number, fen: string): Promise<void>;
    close(): Promise<void>;
  }
  