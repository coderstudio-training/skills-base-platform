import Transport from 'winston-transport';
import { LogEntry } from 'winston';
import { LOGGER_CONFIG } from '../config/logger-config';

interface LokiLogEntry {
  streams: {
    stream: Record<string, string>;
    values: [string, string][];
  }[];
}

interface CustomLokiOptions extends Transport.TransportStreamOptions {
  host: string;
  labels?: Record<string, string>;
  interval?: number;
  timeout?: number;
}

export class CustomLokiTransport extends Transport {
  private host: string;
  private labels: Record<string, string>;
  private batchInterval: number;
  private timeout: number;
  private logQueue: [string, string][];
  private timer: NodeJS.Timeout | null;

  constructor(opts: CustomLokiOptions) {
    super(opts);

    this.host = opts.host;
    this.labels = {
      app: LOGGER_CONFIG.service,
      environment: process.env.NEXT_PUBLIC_ENV || 'production',
      ...opts.labels,
    };
    this.batchInterval = opts.interval || LOGGER_CONFIG.loki.batchInterval;
    this.timeout = opts.timeout || LOGGER_CONFIG.loki.timeout;
    this.logQueue = [];
    this.timer = null;

    // Start processing the queue
    this.startProcessing();
  }

  log(info: LogEntry, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const timestamp = (Date.now() * 1000000).toString(); // Convert to nanoseconds string
    const logEntry = JSON.stringify({
      ...info,
      timestamp: info.timestamp,
    });

    this.logQueue.push([timestamp, logEntry]);

    callback();
  }

  private startProcessing() {
    this.timer = setInterval(() => {
      this.flush().catch(error => {
        console.error('Error flushing logs to Loki:', error);
      });
    }, this.batchInterval);
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const currentBatch = [...this.logQueue];
    this.logQueue = [];

    const lokiEntry: LokiLogEntry = {
      streams: [
        {
          stream: this.labels,
          values: currentBatch,
        },
      ],
    };

    try {
      const response = await fetch(`${this.host}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lokiEntry),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Failed to send logs to Loki: ${response.statusText}`);
      }
    } catch (error) {
      // If the request fails, add the logs back to the queue
      this.logQueue = [...currentBatch, ...this.logQueue];
      throw error;
    }
  }

  close() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    return this.flush();
  }
}
