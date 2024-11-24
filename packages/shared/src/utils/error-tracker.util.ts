import { ErrorContext, ErrorDetails } from '../interfaces/logging.interfaces';

export class ErrorTracker {
  constructor() {}

  trackError(error: Error, context?: ErrorContext): ErrorDetails {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack, // Keep the original stack string intact
      code: (error as any).code,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
      },
    };
  }

  captureException(error: unknown, context?: ErrorContext): ErrorDetails {
    // Handle various error types
    if (error instanceof Error) {
      return this.trackError(error, context);
    }

    // Handle string errors
    if (typeof error === 'string') {
      const err = new Error(error);
      return this.trackError(err, context);
    }

    // Handle unknown error types
    const unknownError = new Error('Unknown error occurred');
    unknownError.name = 'UnknownError';

    // Attach original value for debugging
    if (error !== null && error !== undefined) {
      try {
        (unknownError as any).originalValue = JSON.stringify(error);
      } catch {
        (unknownError as any).originalValue = String(error);
      }
    }

    return this.trackError(unknownError, context);
  }
}
