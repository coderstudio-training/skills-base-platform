import { format } from 'date-fns';
import * as winston from 'winston';

// Enhanced color palette with more vibrant and distinguishable colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',

  // Base colors
  red: '\x1b[38;5;203m', // Softer red
  yellow: '\x1b[38;5;221m', // Warm yellow
  blue: '\x1b[38;5;75m', // Sky blue
  gray: '\x1b[38;5;245m', // Medium gray
  white: '\x1b[38;5;255m', // Bright white
  cyan: '\x1b[38;5;116m', // Soft cyan
  magenta: '\x1b[38;5;176m', // Soft magenta
  green: '\x1b[38;5;114m', // Soft green

  // Background colors
  bgRed: '\x1b[48;5;203m',
  bgYellow: '\x1b[48;5;221m',
  bgBlue: '\x1b[48;5;75m',
  bgGray: '\x1b[48;5;245m',
};

// Enhanced level styles with more consistent visual hierarchy
const levelStyles = {
  error: {
    badge: `${colors.bgRed}${colors.white}${colors.bold}`,
    text: colors.red,
    symbol: '✖',
  },
  warn: {
    badge: `${colors.bgYellow}${colors.white}${colors.bold}`,
    text: colors.yellow,
    symbol: '⚠',
  },
  info: {
    badge: `${colors.bgBlue}${colors.white}${colors.bold}`,
    text: colors.blue,
    symbol: 'ℹ',
  },
  debug: {
    badge: `${colors.bgGray}${colors.white}${colors.bold}`,
    text: colors.gray,
    symbol: '⚙',
  },
};

// Enhanced symbols for better visual hierarchy
const symbols = {
  separator: '│', // Thinner separator for cleaner look
  metadata: '•', // Simple dot for metadata
  stackTrace: '└─', // Tree-like structure for stack traces
  subStack: '├─', // Tree branch for stack items
  subStackLast: '└─', // Tree branch for last stack item
  metadataSymbol: '🔍', // Magnifying glass for metadata section
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

    // Enhanced timestamp format
    const formattedTime = `${colors.gray}${colors.dim}${format(
      new Date(timestamp),
      'yyyy-MM-dd HH:mm:ss.SSS',
    )}${colors.reset}`;

    // Enhanced level badge with padding
    const formattedLevel = `${style.badge} ${level.toUpperCase().padEnd(5)} ${colors.reset}`;

    // Enhanced service and job formatting
    const formattedService = `${colors.cyan}${colors.bold}${service}${colors.reset}`;
    const formattedJob =
      job && !['root'].includes(job)
        ? ` ${colors.magenta}(${job})${colors.reset}`
        : '';

    // Enhanced correlation ID with better visual separation
    const correlationPart = correlationId
      ? `${colors.gray}${symbols.separator} ${colors.dim}${correlationId.slice(0, 8)}${colors.reset}`
      : '';

    // Build the base log line with improved spacing
    let output = `${formattedTime} ${formattedLevel} ${formattedService}${formattedJob} ${style.symbol}  ${style.text}${message}${colors.reset}${correlationPart}\n`;

    // Enhanced error formatting
    if (error) {
      output += `${colors.red}${symbols.stackTrace} ${colors.bold}${error.name}:${colors.reset}${colors.red} ${error.message}${colors.reset}\n`;
      if (error.stack) {
        const formattedStack = error.stack
          .split('\n')
          .slice(1)
          .map(
            (line) =>
              `${colors.gray}   ${symbols.subStack} ${line.trim()}${colors.reset}`,
          )
          .join('\n');
        output += `${formattedStack}\n`;
      }
    }

    // Enhanced error tracking format
    if (errorTracking) {
      output += `${colors.yellow}${symbols.stackTrace} ${colors.bold}Error Tracking Details:${colors.reset}\n`;
      if (errorTracking.context?.environment) {
        output += `   ${symbols.subStack} ${colors.dim}Environment:${colors.reset} ${errorTracking.context.environment}\n`;
      }
      if (errorTracking.error) {
        output += `   ${symbols.subStack} ${colors.dim}${errorTracking.error.name}:${colors.reset} ${errorTracking.error.message}\n`;
      }
    }

    // Enhanced metadata formatting with graphic symbol
    const remainingMeta = { ...metadata };
    excludedMetadataFields.forEach((field) => delete remainingMeta[field]);

    if (Object.keys(remainingMeta).length > 0) {
      output += `${colors.gray}${symbols.stackTrace} ${symbols.metadataSymbol} ${colors.bold}Details${colors.reset}\n`;
      const metaEntries = Object.entries(remainingMeta);
      for (let i = 0; i < metaEntries.length - 1; i++) {
        const [key, value] = metaEntries[i];
        const formattedValue =
          typeof value === 'object'
            ? JSON.stringify(value, null, 2).replace(/\n/g, '\n              ')
            : value;
        output += `   ${symbols.subStack} ${colors.dim}${key}:${colors.reset} ${formattedValue}\n`;
      }
      const [lastKey, lastValue] = metaEntries[metaEntries.length - 1];
      const formattedLastValue =
        typeof lastValue === 'object'
          ? JSON.stringify(lastValue, null, 2).replace(
              /\n/g,
              '\n              ',
            )
          : lastValue;
      output += `   ${symbols.subStackLast} ${colors.dim}${lastKey}:${colors.reset} ${formattedLastValue}\n`;
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
