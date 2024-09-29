// apiClient.ts

import * as https from 'https';
import * as readline from 'readline';
import { EventEmitter } from 'events';

export class ApiClient extends EventEmitter {
  constructor(private channel: string) {
    super();
  }

  public startStream() {
    const options: https.RequestOptions = {
      hostname: 'lichess.org',
      path: `/api/tv/${this.channel}/feed`,
      method: 'GET',
      headers: {
        Accept: 'application/x-ndjson',
      },
    };

    const req = https.request(options, (res) => {
      res.setEncoding('utf8');

      if (res.statusCode !== 200) {
        this.emit('error', new Error(`Request failed. Status Code: ${res.statusCode}`));
        res.resume();
        return;
      }

      const rl = readline.createInterface({
        input: res,
        crlfDelay: Infinity,
      });

      rl.on('line', (line: string) => {
        if (line.trim()) {
          this.emit('data', line);
        }
      });

      rl.on('close', () => {
        this.emit('close');
      });
    });

    req.on('error', (e: Error) => {
      this.emit('error', e);
    });

    req.end();
  }
}
