import * as winston from 'winston';

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

const symbols = {
  separator: '│',
  metadata: '•',
  stackTrace: '└─',
  subStack: '├─',
  subStackLast: '└─',
  metadataSymbol: '🔍',
  errorSymbol: '⛔', // Changed to stop sign emoji
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
}

interface ErrorInfo {
  name?: string;
  message?: string;
  stack?: string;
  context?: {
    environment?: string;
    [key: string]: any;
  };
}

function formatTimestamp(date: Date): string {
  const pad = (n: number): string => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
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
    const isError = level === 'error';

    // Format timestamp using native Date
    const formattedTime = `${colors.gray}${colors.dim}${formatTimestamp(new Date(timestamp))}${colors.reset}`;

    // Enhanced level badge with padding
    const formattedLevel = `${style.badge} ${level.toUpperCase().padEnd(5)} ${colors.reset}`;

    // Service and job formatting
    const formattedService = `${colors.cyan}${colors.bold}${service}${colors.reset}`;
    const formattedJob =
      job && !['root'].includes(job)
        ? ` ${colors.magenta}(${job})${colors.reset}`
        : '';

    // Correlation ID with visual separation
    const correlationPart = correlationId
      ? `${colors.gray} ${symbols.separator} ${colors.dim}${correlationId.slice(0, 8)}${colors.reset}`
      : '';

    // Build the base log line
    let output = `${formattedTime} ${formattedLevel} ${formattedService}${formattedJob} ${style.symbol}  ${style.text}${message}${colors.reset}${correlationPart}\n`;

    // Enhanced unified error handling
    const formatErrorDetails = (errorInfo: ErrorInfo, indent: string = '') => {
      let errorOutput = '';

      if (errorInfo.name || errorInfo.message) {
        errorOutput += `${indent}${colors.red}${symbols.errorSymbol} ${colors.bold}${errorInfo.name || 'Error'}:${colors.reset}${colors.red} ${errorInfo.message}${colors.reset}\n`;
      }

      if (errorInfo.context) {
        Object.entries(errorInfo.context).forEach(
          ([key, value], index, array) => {
            const isLast = index === array.length - 1;
            const contextSymbol = isLast
              ? symbols.subStackLast
              : symbols.subStack;
            const formattedValue =
              typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : value;
            errorOutput += `${indent}   ${contextSymbol} ${colors.dim}${key}:${colors.reset} ${formattedValue}\n`;
          },
        );
      }

      if (errorInfo.stack) {
        const stackLines = errorInfo.stack.split('\n').slice(1);
        stackLines.forEach((line, index) => {
          const isLast = index === stackLines.length - 1;
          const stackSymbol = isLast ? symbols.subStackLast : symbols.subStack;
          errorOutput += `${indent}   ${stackSymbol} ${colors.gray}${line.trim()}${colors.reset}\n`;
        });
      }

      return errorOutput;
    };

    // Show error details if it's an error
    if (isError && (error || errorTracking)) {
      output += `${colors.red}${symbols.stackTrace} ${colors.bold}Error Details${colors.reset}\n`;

      if (error) {
        output += formatErrorDetails(
          {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          '   ',
        );
      }

      if (errorTracking) {
        const errorTrackingData = {
          ...errorTracking,
        };

        if (error) {
          output += `      ${symbols.stackTrace} ${colors.dim}Additional Error Context${colors.reset}\n`;
        }
        output += formatErrorDetails(errorTrackingData, '      ');
      }
    }
    // Only show metadata/details for non-error logs
    else if (!isError) {
      // Metadata formatting
      const remainingMeta = { ...metadata };
      excludedMetadataFields.forEach((field) => delete remainingMeta[field]);

      if (Object.keys(remainingMeta).length > 0) {
        output += `${colors.gray}${symbols.stackTrace} ${symbols.metadataSymbol} ${colors.bold}Details${colors.reset}\n`;
        const metaEntries = Object.entries(remainingMeta);
        metaEntries.forEach(([key, value], index) => {
          const isLast = index === metaEntries.length - 1;
          const metaSymbol = isLast ? symbols.subStackLast : symbols.subStack;
          const formattedValue =
            typeof value === 'object'
              ? JSON.stringify(value, null, 2).replace(
                  /\n/g,
                  '\n              ',
                )
              : value;
          output += `   ${metaSymbol} ${colors.dim}${key}:${colors.reset} ${formattedValue}\n`;
        });
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
