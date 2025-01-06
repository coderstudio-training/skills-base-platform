import { LoggerInterface, LogMetadata } from '@/lib/types/logger';

class LazyLogger implements LoggerInterface {
  private logger: LoggerInterface | null = null;
  private initPromise: Promise<void> | null = null;

  private async initLogger(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      (async () => {
        try {
          if (typeof window === 'undefined') {
            // Server-side
            const { getServerLogger } = await import('./server');
            this.logger = await getServerLogger();
          } else {
            // Client-side
            const { clientLogger } = await import('./client');
            this.logger = clientLogger;
          }
          resolve();
        } catch (error) {
          console.error('Failed to initialize logger:', error);
          reject(error);
        }
      })();
    });

    return this.initPromise;
  }

  private async ensureLogger() {
    if (!this.logger) {
      await this.initLogger();
    }
  }

  async error(message: string | Error, metadata?: LogMetadata) {
    await this.ensureLogger();
    this.logger?.error(message, metadata);
  }

  async warn(message: string, metadata?: LogMetadata) {
    await this.ensureLogger();
    this.logger?.warn(message, metadata);
  }

  async info(message: string, metadata?: LogMetadata) {
    await this.ensureLogger();
    this.logger?.info(message, metadata);
  }
}

export const logger = new LazyLogger();
