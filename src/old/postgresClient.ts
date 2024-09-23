// postgresClient.ts

import { Pool } from 'pg';
import { config } from 'dotenv';
import { GameData, Player } from '../types/types';

config();

const usePostgres = process.env.USE_POSTGRES === 'true';

export let pool: Pool | null = null;
export let insertMatch: (gameData: GameData) => Promise<void>;
export let insertPlayers: (
  matchId: string,
  players: Player[]
) => Promise<void>;
export let insertMove: (
  matchId: string,
  moveNumber: number,
  fen: string
) => Promise<void>;

if (usePostgres) {
  pool = new Pool({
    user: process.env.DB_USER || 'your_db_user',
    host: process.env.DB_HOST || 'your_db_host',
    database: process.env.DB_DATABASE || 'your_database',
    password: process.env.DB_PASSWORD || 'your_db_password',
    port: Number(process.env.DB_PORT) || 5432,
  });

  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(1); // Exit if PostgreSQL connection fails
  });

  insertMatch = async (gameData: GameData): Promise<void> => {
    const queryText = `
      INSERT INTO match (lichess_match_id, channel, orientation, fen)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (lichess_match_id) DO NOTHING
    `;
    const values = [
      gameData.id,
      gameData.channel,
      gameData.orientation,
      gameData.fen,
    ];
    await pool!.query(queryText, values);
  };

  insertPlayers = async (
    matchId: string,
    players: Player[]
  ): Promise<void> => {
    const client = await pool!.connect();
    try {
      await client.query('BEGIN');
      for (const player of players) {
        const queryText = `
          INSERT INTO players (match_id, color, username, title, rating)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `;
        const values = [
          matchId,
          player.color,
          player.user.name,
          player.user.title || null,
          player.rating,
        ];
        await client.query(queryText, values);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  insertMove = async (
    matchId: string,
    moveNumber: number,
    fen: string
  ): Promise<void> => {
    const queryText = `
      INSERT INTO moves (match_id, move_number, fen)
      VALUES ($1, $2, $3)
    `;
    const values = [matchId, moveNumber, fen];
    await pool!.query(queryText, values);
  };
} else {
  // Mock implementations that do nothing
  insertMatch = async (gameData: GameData): Promise<void> => {
    // Do nothing
  };

  insertPlayers = async (
    matchId: string,
    players: Player[]
  ): Promise<void> => {
    // Do nothing
  };

  insertMove = async (
    matchId: string,
    moveNumber: number,
    fen: string
  ): Promise<void> => {
    // Do nothing
  };
}
