import { ArgumentsHost, Logger } from '@nestjs/common';
import { ErrorContext } from '../interfaces/logging.interfaces';
import { ErrorTracker } from '../utils/error-tracker.util';
import { HttpContextUtils } from '../utils/http.utils';

export abstract class BaseExceptionFilter {
  protected readonly logger: Logger;
  protected readonly errorTracker: ErrorTracker;

  constructor(context: string) {
    this.logger = new Logger(context);
    this.errorTracker = new ErrorTracker();
  }

  protected getErrorContext(host: ArgumentsHost): ErrorContext {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const requestContext = HttpContextUtils.getRequestContext(request);

    return {
      userId: requestContext.userId,
      correlationId: requestContext.correlationId,
      component: 'request-handler',
      path: requestContext.path,
      method: requestContext.method,
      query: requestContext.query,
      timestamp: new Date().toISOString(),
    };
  }

  protected logError(
    error: Error,
    context: ErrorContext,
    statusCode: number,
  ): void {
    const errorDetails = this.errorTracker.trackError(error, context);

    if (statusCode >= 500) {
      this.logger.error(error, {
        type: 'request.error',
        ...context,
        error: errorDetails,
        statusCode,
      });
    } else {
      this.logger.warn(`Request failed with status ${statusCode}`, {
        type: 'request.failed',
        ...context,
        error: errorDetails,
        statusCode,
      });
    }
  }
}
