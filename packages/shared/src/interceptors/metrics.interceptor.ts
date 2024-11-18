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
    const metricConfig = this.reflector.get<MetricOptions>(
      METRIC_KEY,
      context.getHandler(),
    );
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const path = req.route?.path || req.path;
    const startTime = Date.now();

    this.metricsService.trackHttpRequestProgress(method, path, true);

    return next.handle().pipe(
      tap({
        next: () => this.handleSuccess(context, startTime, metricConfig),
        error: (error) =>
          this.handleError(context, startTime, error, metricConfig),
      }),
    );
  }

  private handleSuccess(
    context: ExecutionContext,
    startTime: number,
    metricConfig?: MetricOptions,
  ): void {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const duration = (Date.now() - startTime) / 1000;

    this.metricsService.trackHttpRequest(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      duration,
    );
    this.metricsService.trackHttpRequestProgress(
      req.method,
      req.route?.path || req.path,
      false,
    );

    if (metricConfig?.eventType) {
      this.metricsService.trackBusinessEvent(metricConfig.eventType, 'success');
    }
  }

  private handleError(
    context: ExecutionContext,
    startTime: number,
    error: any,
    metricConfig?: MetricOptions,
  ): void {
    const req = context.switchToHttp().getRequest();
    const duration = (Date.now() - startTime) / 1000;
    const status = error.status || 500;

    this.metricsService.trackHttpRequest(
      req.method,
      req.route?.path || req.path,
      status,
      duration,
    );
    this.metricsService.trackHttpRequestProgress(
      req.method,
      req.route?.path || req.path,
      false,
    );

    if (metricConfig?.eventType) {
      this.metricsService.trackBusinessEvent(metricConfig.eventType, 'error');
    }
  }
}
