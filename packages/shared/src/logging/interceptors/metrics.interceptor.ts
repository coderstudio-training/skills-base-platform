import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from '../services/prometheus.service';
import { METRIC_KEY, MetricOptions } from '../decorators/metrics.decorators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metricConfig: MetricOptions = this.reflector.get(
      METRIC_KEY,
      context.getHandler(),
    );
    if (!metricConfig) return next.handle();

    const { name, help, labelNames = [] } = metricConfig;
    const histogram = this.prometheusService.getHistogram(
      `${name}_duration_seconds`,
      help || `Duration of ${name} operation`,
      [...labelNames, 'status', 'method', 'path'],
    );

    const req = context.switchToHttp().getRequest();
    const timer = histogram.startTimer();

    return next.handle().pipe(
      tap({
        next: () => {
          timer({
            status: 'success',
            method: req.method,
            path: req.route?.path || req.path,
            service: this.prometheusService['serviceName'],
          });
        },
        error: () => {
          timer({
            status: 'error',
            method: req.method,
            path: req.route?.path || req.path,
            service: this.prometheusService['serviceName'],
          });
        },
      }),
    );
  }
}
