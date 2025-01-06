import * as os from 'os';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

interface LokiTransportOptions {
  service: string;
  job: string;
}

export const createLokiTransport = (
  options: LokiTransportOptions,
): winston.transport => {
  const transport = new LokiTransport({
    host: process.env.LOKI_HOST || 'http://localhost:3100',
    interval: 30,
    json: true,
    labels: {
      app: options.service,
      job: options.job,
      environment: process.env.NODE_ENV || 'development',
      host: os.hostname(),
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    replaceTimestamp: false,
    onConnectionError: (err: Error) => {
      console.error('Error connecting to Loki:', err.message);
    },
  });

  // Log connection success after instantiating the transport.
  console.info('Attempting to connect to Loki...');
  const checkConnection = async () => {
    try {
      await fetch(process.env.LOKI_HOST || 'http://localhost:3100/ready');
      console.info('Successfully connected to Loki.');
    } catch (err) {
      console.warn(
        'Loki connection success could not be verified:',
        err.message,
      );
    }
  };

  checkConnection();

  return transport;
};
