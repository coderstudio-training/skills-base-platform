import { format } from 'date-fns';
import * as winston from 'winston';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[91m',
  yellow: '\x1b[93m',
  blue: '\x1b[94m',
  gray: '\x1b[90m',
  white: '\x1b[97m',
  cyan: '\x1b[96m',
  magenta: '\x1b[95m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgGray: '\x1b[100m',
};

const levelStyles = {
  error: {
    badge: `${colors.bgRed}${colors.white}`,
    text: colors.red,
  },
  warn: {
    badge: `${colors.bgYellow}${colors.white}`,
    text: colors.yellow,
  },
  info: {
    badge: `${colors.bgBlue}${colors.white}`,
    text: colors.blue,
  },
  debug: {
    badge: `${colors.bgGray}${colors.white}`,
    text: colors.gray,
  },
};

const symbols = {
  error: '✖',
  warn: '⚠',
  info: 'ℹ',
  debug: '⚙',
  separator: '┃',
  metadata: '•',
};

const excludedMetadataFields = new Set(['type']);

interface LogMetadata extends winston.Logform.TransformableInfo {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  job: string;
  correlationId?: string;
  error?: Error;
  errorTracking?: any;
  [key: string]: any;
}

export const createConsoleFormat = () => {
  return winston.format.printf((info: LogMetadata) => {
    const {
      timestamp,
      level,
      message,
      service,
      job,
      correlationId,
      error,
      errorTracking,
      ...metadata
    } = info;

    const style = levelStyles[level as keyof typeof levelStyles];
    const symbol = symbols[level as keyof typeof symbols];

    const formattedTime = `${colors.gray}${format(
      new Date(timestamp),
      'yyyy-MM-dd hh:mm:ss.SSS a',
    )}${colors.reset}`;

    // Format level
    const formattedLevel = `${style.badge} ${level.toUpperCase()} ${
      colors.reset
    }`;

    // Format service and job
    const formattedService = `${colors.cyan}[${service}]${colors.reset}`;
    // Only show job if it's not 'main'/'app'
    const formattedJob =
      job && !['root'].includes(job)
        ? `${colors.magenta}(${job})${colors.reset}`
        : '';

    // Format correlation ID if present
    const correlationPart = correlationId
      ? `${colors.gray}${symbols.separator} ${correlationId.slice(0, 8)}${
          colors.reset
        }`
      : '';

    // Build the base log line with service and job info
    let output = `${formattedTime} ${formattedLevel} ${formattedService} ${formattedJob} ${symbol}  ${
      style.text
    }${message}${colors.reset} ${correlationPart}\n`;

    // Add error details if present
    if (error) {
      output += `${colors.red}        ${error.name}: ${error.message}${
        colors.reset
      }\n`;
      if (error.stack) {
        const formattedStack = error.stack
          .split('\n')
          .slice(1)
          .map(
            (line) =>
              `${colors.gray}    ${symbols.metadata} ${line.trim()}${
                colors.reset
              }`,
          )
          .join('\n');
        output += `${formattedStack}\n`;
      }
    }

    // Add error tracking info if present
    if (errorTracking) {
      output += `${colors.yellow}        Error Tracking Details:${colors.reset}\n`;
      if (errorTracking.context?.environment) {
        output += `    ${symbols.metadata} Environment: ${errorTracking.context.environment}\n`;
      }
      if (errorTracking.error) {
        output += `    ${symbols.metadata} ${errorTracking.error.name}: ${errorTracking.error.message}\n`;
      }
    }

    const remainingMeta = { ...metadata };
    for (const field of excludedMetadataFields) {
      delete remainingMeta[field];
    }

    if (Object.keys(remainingMeta).length > 0) {
      for (const [key, value] of Object.entries(remainingMeta)) {
        const formattedValue =
          typeof value === 'object'
            ? JSON.stringify(value, null, 2).replace(/\n/g, '\n            ')
            : value;
        output += `    ${symbols.metadata} ${key}: ${formattedValue}\n`;
      }
    }

    return output;
  });
};

export const createJsonFormat = (
  baseMetadata: winston.Logform.Format,
  errorFormat: winston.Logform.Format,
  maskSecrets: winston.Logform.Format,
) => {
  return winston.format.combine(
    baseMetadata,
    errorFormat,
    maskSecrets,
    winston.format.timestamp(),
    winston.format.json(),
  );
};
