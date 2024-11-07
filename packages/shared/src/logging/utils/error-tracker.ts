import { Logger } from '../logger';
import { ConfigurationManager } from '../config';

export interface ErrorContext {
  userId?: string;
  correlationId?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  [key: string]: any;
}

export class ErrorTracker {
  private readonly logger: Logger;
  private readonly config: ReturnType<
    typeof ConfigurationManager.prototype.getErrorTrackerConfig
  >;

  constructor(logger: Logger) {
    this.logger = logger;
    this.config = ConfigurationManager.getInstance().getErrorTrackerConfig();
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private extractStackInfo(error: Error): {
    message: string;
    stack: string[];
    type: string;
  } {
    const stack = error.stack?.split('\n').slice(1) || [];
    return {
      message: error.message,
      stack: stack.slice(0, this.config.maxStackFrames),
      type: error.name,
    };
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    let normalized: Error;
    if (typeof error === 'string') {
      normalized = new Error(error);
    } else {
      normalized = new Error('Unknown error');
      normalized.name = 'UnknownError';
    }

    (normalized as any).originalValue = error;
    return normalized;
  }

  async trackError(error: Error, context: ErrorContext = {}) {
    if (!this.shouldSample()) return;

    const stackInfo = this.extractStackInfo(error);
    const enrichedContext = {
      ...context,
      environment: this.config.environment,
      release: this.config.release,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: stackInfo.stack,
      },
    };

    await this.logger.error(error, enrichedContext);
  }

  async captureException(error: unknown, context: ErrorContext = {}) {
    const normalizedError = this.normalizeError(error);
    await this.trackError(normalizedError, context);
  }
}
