// src/main.ts

import './server';
import { streamChannel } from './lichessStream';
import { channels } from './channels';
import { config } from 'dotenv';

config();

async function main() {
  for (const channel of channels) {
    streamChannel(channel);
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    // Implement any necessary cleanup if needed
    process.exit(0);
  });
}

main();
