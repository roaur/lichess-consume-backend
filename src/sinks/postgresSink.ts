// postgresSink.ts

import { Sink } from './sink';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { GameData, Player } from '../types/types';

config();

export class PostgresSink implements Sink {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'your_db_user',
      host: process.env.DB_HOST || 'your_db_host',
      database: process.env.DB_DATABASE || 'your_database',
      password: process.env.DB_PASSWORD || 'your_db_password',
      port: Number(process.env.DB_PORT) || 5432,
    });

    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      process.exit(1); // Exit if PostgreSQL connection fails
    });
  }

  async initialize(): Promise<void> {
    // Connection is handled automatically in pg Pool
    console.log('Connected to PostgreSQL.');
  }

  async writeMatch(gameData: GameData): Promise<void> {
    const queryText = `
      INSERT INTO match (lichess_match_id, channel, orientation, fen)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (lichess_match_id) DO NOTHING
    `;
    const values = [gameData.id, gameData.channel, gameData.orientation, gameData.fen];
    await this.pool.query(queryText, values);
    console.log('Match data inserted into PostgreSQL.');
  }

  async writePlayers(matchId: string, players: Player[]): Promise<void> {
    const client = await this.pool.connect();
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
      console.log('Players data inserted into PostgreSQL.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async writeMove(matchId: string, moveNumber: number, fen: string): Promise<void> {
    const queryText = `
      INSERT INTO moves (match_id, move_number, fen)
      VALUES ($1, $2, $3)
    `;
    const values = [matchId, moveNumber, fen];
    await this.pool.query(queryText, values);
    console.log(`Move ${moveNumber} inserted into PostgreSQL.`);
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log('Disconnected from PostgreSQL.');
  }
}
