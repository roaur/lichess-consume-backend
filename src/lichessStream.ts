// src/lichessStream.ts

import * as https from 'https';
import * as readline from 'readline';
import { IncomingMessage } from 'http';
import { DataProcessor } from './data/dataProcessor';
import { Persistence } from './data/persistence';
import { config } from 'dotenv';
import { GameData } from './types/types';

config();

export async function streamChannel(channel: string) {
  let shouldReconnect = true;
  let reconnectDelay = 5000; // Delay in milliseconds before attempting to reconnect

  // Instantiate dataProcessor and persistence outside the loop to maintain state
  const dataProcessor = new DataProcessor(channel);
  const persistence = new Persistence(channel);

  await persistence.initialize();

  while (shouldReconnect) {
    try {
      await startStream(channel, dataProcessor, persistence);
      // If the stream ends naturally, exit the loop
      shouldReconnect = false;
    } catch (error: any) {
      console.error(`[${channel}] Stream error:`, error);
      if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
        console.log(
          `[${channel}] Connection lost. Attempting to reconnect in ${
            reconnectDelay / 1000
          } seconds...`
        );
        await delay(reconnectDelay);
      } else {
        console.error(`[${channel}] Unhandled error. Exiting stream.`);
        shouldReconnect = false;
      }
    }
  }

  // Close persistence when done
  await persistence.close();
}

async function startStream(
  channel: string,
  dataProcessor: DataProcessor,
  persistence: Persistence
) {
  return new Promise<void>((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'lichess.org',
      path: `/api/tv/${channel}/feed`,
      method: 'GET',
      headers: {
        Accept: 'application/x-ndjson',
      },
    };

    const req = https.request(options, (res: IncomingMessage) => {
      res.setEncoding('utf8');

      if (res.statusCode !== 200) {
        console.error(
          `[${channel}] Request Failed. Status Code: ${res.statusCode}`
        );
        res.resume();
        reject(
          new Error(`Request failed with status code ${res.statusCode}`)
        );
        return;
      }

      const rl = readline.createInterface({
        input: res,
        crlfDelay: Infinity,
      });

      // Remove event listeners to avoid duplicates
      dataProcessor.removeAllListeners();
      rl.removeAllListeners();

      dataProcessor.on('featured', async (gameData: GameData) => {
        try {
          const matchId = await persistence.saveFeatured(gameData);
          dataProcessor.setCurrentMatchId(matchId);
        } catch (error) {
          console.error(`[${channel}] Error in saving featured data:`, error);
        }
      });

      dataProcessor.on('fen', async ({ matchId, moveNumber, fen }) => {
        if (matchId) {
          try {
            await persistence.saveFen(matchId, moveNumber, fen);
          } catch (error) {
            console.error(`[${channel}] Error in saving fen data:`, error);
          }
        } else {
          console.warn(`[${channel}] Match ID is null. Cannot save fen data.`);
        }
      });

      dataProcessor.on('error', (error: Error) => {
        console.error(`[${channel}] Data Processor error:`, error);
      });

      rl.on('line', async (line: string) => {
        dataProcessor.processData(line);
      });

      rl.on('close', () => {
        console.log(`[${channel}] Stream closed.`);
        resolve(); // Resolve the promise to stop the stream
      });

      rl.on('error', (error: any) => {
        console.error(`[${channel}] Readline error:`, error);
        reject(error); // Reject the promise to trigger reconnection
      });
    });

    req.on('error', (error: any) => {
      console.error(`[${channel}] Request error:`, error);
      reject(error); // Reject the promise to trigger reconnection
    });

    req.end();
  });
}

// Utility function to delay execution
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
