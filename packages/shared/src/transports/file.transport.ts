import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { WinstonLoggerConfig } from '../interfaces/logging.interfaces';
import { createJsonFormat } from '../utils/formatter.util';

export const createFileTransport = (
  config: WinstonLoggerConfig,
  baseMetadata: winston.Logform.Format,
  errorFormat: winston.Logform.Format,
  maskSecrets: winston.Logform.Format,
): winston.transport => {
  return new winston.transports.DailyRotateFile({
    dirname: config.file!.path,
    filename: config.file!.namePattern,
    datePattern: config.file!.rotatePattern,
    zippedArchive: config.file!.compress,
    maxSize: config.maxSize,
    maxFiles: config.maxFiles,
    format: createJsonFormat(baseMetadata, errorFormat, maskSecrets),
    level: config.level,
  });
};
