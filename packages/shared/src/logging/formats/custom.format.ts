import { format } from 'winston';
import { inspect } from 'util';

export const customFormat = format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    const metadataStr = Object.keys(metadata).length
      ? `\n${inspect(metadata, { colors: true, depth: 5 })}`
      : '';

    return `${timestamp} [${level.toUpperCase()}] ${message}${metadataStr}`;
  },
);
