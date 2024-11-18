import { differenceInDays, parse } from 'date-fns';
import { promises as fs } from 'fs';
import { join } from 'path';
import { LogFileConfig } from '../interfaces/logging.interfaces';
import { Logger } from './logger.util';

export class LogRetentionManager {
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: LogFileConfig,
    private readonly logger: Logger,
  ) {
    if (config.retention?.enabled) {
      this.startRetentionCheck();
    }
  }

  private async getLogFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.config.path);
      return files.filter((file) => file.match(/.*\.log(\.[0-9]+)?$/));
    } catch (error) {
      this.logger.error('Failed to read log directory', { error });
      return [];
    }
  }

  private async getFileDate(filename: string): Promise<Date | null> {
    try {
      // Extract date from filename using the rotatePattern
      const dateMatch = filename.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        return parse(dateMatch[0], 'yyyy-MM-dd', new Date());
      }

      // If no date in filename, use file stats
      const stats = await fs.stat(join(this.config.path, filename));
      return stats.mtime;
    } catch (error) {
      this.logger.error('Failed to get file date', { error, filename });
      return null;
    }
  }

  private async deleteFile(filename: string): Promise<void> {
    try {
      const filepath = join(this.config.path, filename);
      await fs.unlink(filepath);
      this.logger.info(`Deleted old log file: ${filename}`);
    } catch (error) {
      this.logger.error('Failed to delete log file', { error, filename });
    }
  }

  async checkRetention(): Promise<void> {
    if (!this.config.retention?.enabled) return;

    const files = await this.getLogFiles();
    const now = new Date();

    for (const file of files) {
      const fileDate = await this.getFileDate(file);
      if (!fileDate) continue;

      const daysDiff = differenceInDays(now, fileDate);
      if (daysDiff > this.config.retention.days) {
        await this.deleteFile(file);
      }
    }
  }

  private startRetentionCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(
      () => this.checkRetention(),
      this.config.retention!.checkInterval,
    );
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
