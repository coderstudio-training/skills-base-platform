// utils/file-writer.ts
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { WinstonLoggerConfig } from '../interfaces/logging.interfaces';
import { Logger } from '../services/logger.service';
import { LogRetentionManager } from './log-retention.util';

export class LogFileWriter {
  private currentFileSize: number = 0;
  private currentFile: string;
  private writePromise: Promise<void> = Promise.resolve();
  private readonly lockFile: string;
  private retentionManager?: LogRetentionManager;
  constructor(
    private readonly options: Required<WinstonLoggerConfig>,
    private readonly logger: Logger,
  ) {
    this.currentFile = this.options.filename;
    this.lockFile = `${this.options.filename}.lock`;

    if (this.options.file?.retention?.enabled) {
      this.retentionManager = new LogRetentionManager(
        this.options.file,
        logger,
      );
    }
  }

  private async acquireLock(): Promise<boolean> {
    try {
      await fs.writeFile(this.lockFile, process.pid.toString(), { flag: 'wx' });
      return true;
    } catch {
      return false;
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      await fs.unlink(this.lockFile);
    } catch {
      this.logger.warn('Failed to delete lock file');
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    const dir = dirname(this.currentFile);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async rotateFile(): Promise<void> {
    const hasLock = await this.acquireLock();
    if (!hasLock) {
      return; // Another process is handling rotation
    }

    try {
      // Check if we still need to rotate (size might have changed)
      const stats = await fs.stat(this.currentFile);
      if (stats.size < this.options.maxSize) {
        return;
      }

      // Rotate files
      for (let i = this.options.maxFiles - 1; i > 0; i--) {
        const fromFile =
          i === 1 ? this.currentFile : `${this.currentFile}.${i - 1}`;
        const toFile = `${this.currentFile}.${i}`;

        try {
          await fs.rename(fromFile, toFile);
        } catch {
          this.logger.warn('Failed to rotate log file');
        }
      }

      // Create new file
      await fs.writeFile(this.currentFile, '', { flag: 'w' });
      this.currentFileSize = 0;
    } finally {
      await this.releaseLock();
    }
  }

  private formatLogEntry(message: string): string {
    // Ensure each log entry ends with a newline
    return message.endsWith('\n') ? message : message + '\n';
  }

  async write(message: string): Promise<void> {
    // Chain writes to ensure ordering
    this.writePromise = this.writePromise.then(async () => {
      try {
        await this.ensureDirectoryExists();

        const formattedMessage = this.formatLogEntry(message);
        const messageSize = Buffer.byteLength(formattedMessage);

        // Check if we need to rotate
        if (this.currentFileSize + messageSize > this.options.maxSize) {
          await this.rotateFile();
        }

        // Append to file
        await fs.appendFile(this.currentFile, formattedMessage);
        this.currentFileSize += messageSize;
      } catch (error) {
        this.logger.error('Failed to write to log file', { error });

        // Try writing to a fallback location
        const fallbackPath = join(process.cwd(), 'logs-fallback.log');
        try {
          await fs.appendFile(fallbackPath, this.formatLogEntry(message));
        } catch {
          this.logger.warn('Failed to write to fallback log file');
        }
      }
    });

    return this.writePromise;
  }

  async getCurrentFiles(): Promise<string[]> {
    const files: string[] = [this.currentFile];
    for (let i = 1; i < this.options.maxFiles; i++) {
      files.push(`${this.currentFile}.${i}`);
    }
    return files.filter(async (file) => {
      try {
        await fs.access(file);
        return true;
      } catch {
        return false;
      }
    });
  }

  async getSize(): Promise<number> {
    try {
      const stats = await fs.stat(this.currentFile);
      return stats.size;
    } catch {
      return 0;
    }
  }

  async destroy(): Promise<void> {
    this.retentionManager?.stop();
  }
}

// Updated writeToFile function that uses the LogFileWriter
const writers = new Map<string, LogFileWriter>();

export async function writeToFile(
  message: string,
  options: Required<WinstonLoggerConfig>,
): Promise<void> {
  let writer = writers.get(options.filename);
  if (!writer) {
    writer = new LogFileWriter(options, new Logger('file-writer'));
    writers.set(options.filename, writer);
  }

  await writer.write(message);
}
