import axios from 'axios';
import { LogEntry } from 'winston';
import Transport from 'winston-transport';

interface LokiTransportOptions {
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

    const timestamp = new Date().getTime() * 1000000; // Convert to nanoseconds
    const labels = {
      ...this.labels,
      level: info.level,
      service: info.service || 'unknown',
    };

    const lokiEntry = {
      streams: [
        {
          stream: labels,
          values: [[`${timestamp}`, JSON.stringify(info)]],
        },
      ],
    };

    try {
      await axios.post(`${this.host}/loki/api/v1/push`, lokiEntry, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to send logs to Loki:', error);
    }

    callback();
  }
}
