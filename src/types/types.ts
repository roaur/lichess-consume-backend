// types.ts

export interface User {
    name: string;
    title?: string;
  }
  
  export interface Player {
    color: string;
    user: User;
    rating: number;
  }
  
  export interface GameData {
    id: string; // Lichess match ID
    orientation: string;
    players: Player[];
    fen: string;
    channel: string;
    // Additional properties can be added if needed
  }
  
  export interface LichessData {
    t: string;
    d: any;
  }
  
  export interface FenData {
    matchId: string;
    moveNumber: number;
    fen: string;
  }
  