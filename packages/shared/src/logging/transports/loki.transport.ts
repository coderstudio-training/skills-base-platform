import axios from 'axios';
import { LogEntry } from 'winston';
import * as Transport from 'winston-transport';

interface LokiTransportOptions extends Transport.TransportStreamOptions {
  host: string;
  labels: Record<string, string>;
}

export class LokiTransport extends Transport {
  private readonly host: string;
  private readonly labels: Record<string, string>;

  constructor(opts: LokiTransportOptions) {
    super(opts);
    this.host = opts.host;
    this.labels = opts.labels;
  }

  async log(info: LogEntry, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const timestamp = (Date.now() * 1000000).toString();

    const labels = {
      ...this.labels,
      level: info.level || 'info',
      service: info.service || 'unknown',
    };

    const logLine = JSON.stringify({
      ...info,
      labels: undefined,
    });

    const lokiEntry = {
      streams: [
        {
          stream: labels,
          values: [[timestamp, logLine]],
        },
      ],
    };

    try {
      await axios.post(`${this.host}/loki/api/v1/push`, lokiEntry, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
    } catch (error) {
      console.error('Failed to send logs to Loki:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
      }
    }

    callback();
  }
}
