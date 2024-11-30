import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { METRIC_KEY, MetricOptions } from '../decorators/metrics.decorators';
import { ApplicationMetricsService } from '../services/prometheus.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    private readonly metricsService: ApplicationMetricsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get HTTP request details
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const path = req.route?.path || req.path;

    // Get metric configuration from decorator if present
    const metricConfig = this.reflector.get<MetricOptions>(
      METRIC_KEY,
      context.getHandler(),
    );

    const startTime = Date.now();

    // Track request start
    this.metricsService.trackHttpRequestProgress(method, path, true);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const res = context.switchToHttp().getResponse();

          // Track successful request
          this.metricsService.trackHttpRequest(
            method,
            path,
            res.statusCode,
            duration,
          );
          this.metricsService.trackHttpRequestProgress(method, path, false);

          // Track business metric if configured
          if (metricConfig?.eventType) {
            this.metricsService.trackBusinessEvent(
              metricConfig.eventType,
              'success',
            );
          }
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const status = error.status || 500;

          // Track failed request
          this.metricsService.trackHttpRequest(method, path, status, duration);
          this.metricsService.trackHttpRequestProgress(method, path, false);

          // Track business metric failure if configured
          if (metricConfig?.eventType) {
            this.metricsService.trackBusinessEvent(
              metricConfig.eventType,
              'error',
            );
          }
        },
      }),
    );
  }
}
