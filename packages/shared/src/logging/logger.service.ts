import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { customFormat } from './formats/custom.format';
import { LogMetadata } from './interfaces/log-metadata.interface';
import { LoggerConfig } from './interfaces/logger-config.interface';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  private readonly defaultConfig: LoggerConfig = {
    service: 'unknown-service',
    level: 'info',
    format: 'json',
    transports: {
      console: true,
      file: {
        enabled: false,
        filename: 'logs/app-%DATE%.log',
        maxFiles: 100,
        maxSize: '20m',
      },
      elastic: {
        enabled: false,
        node: 'http://localhost:9200',
        index: 'logs',
      },
    },
  };

  constructor(config: Partial<LoggerConfig>) {
    this.initializeLogger({ ...this.defaultConfig, ...config });
  }

  private initializeLogger(config: LoggerConfig) {
    const transports: winston.transport[] = [];
    const logFormat =
      config.format === 'json'
        ? winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          )
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            customFormat,
          );

    // Console Transport
    if (config.transports?.console) {
      transports.push(new winston.transports.Console());
    }

    // File Transport
    if (config.transports?.file?.enabled) {
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: config.transports.file.filename,
          maxFiles: config.transports.file.maxFiles,
          maxSize: config.transports.file.maxSize,
          format: logFormat,
        }),
      );
    }

    // Elasticsearch Transport
    if (config.transports?.elastic?.enabled) {
      transports.push(
        new ElasticsearchTransport({
          level: config.level,
          indexPrefix: config.transports.elastic.index,
          clientOpts: {
            node: config.transports.elastic.node,
          },
          apm: {
            enabled: true,
            serviceName: 'my-service',
            serviceVersion: '1.0.0',
          },
        }),
      );
    }

    this.logger = winston.createLogger({
      level: config.level,
      format: logFormat,
      defaultMeta: {
        service: config.service,
      },
      transports,
    });
  }

  private formatMessage(
    message: string,
    metadata?: LogMetadata,
  ): [string, any] {
    const formattedMetadata = {
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    return [message, formattedMetadata];
  }

  log(message: string, metadata?: LogMetadata) {
    const [msg, meta] = this.formatMessage(message, metadata);
    this.logger.info(msg, meta);
  }

  error(message: string, metadata?: LogMetadata) {
    const [msg, meta] = this.formatMessage(message, metadata);
    this.logger.error(msg, meta);
  }

  warn(message: string, metadata?: LogMetadata) {
    const [msg, meta] = this.formatMessage(message, metadata);
    this.logger.warn(msg, meta);
  }

  debug(message: string, metadata?: LogMetadata) {
    const [msg, meta] = this.formatMessage(message, metadata);
    this.logger.debug(msg, meta);
  }
}
