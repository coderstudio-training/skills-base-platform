import * as winston from 'winston';
import { WinstonLoggerConfig } from '../interfaces/logging.interfaces';
import { createConsoleFormat } from '../utils/formatter.util';

export const createConsoleTransport = (
  config: WinstonLoggerConfig,
): winston.transport => {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      createConsoleFormat(),
    ),
    level: config.level,
  });
};
