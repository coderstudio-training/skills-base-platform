import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusService } from '../services/prometheus.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly httpRequestsTotal;
  private readonly httpRequestDuration;
  private readonly httpRequestsActive;

  constructor(private readonly prometheusService: PrometheusService) {
    // Initialize metrics with valid names
    this.httpRequestsTotal = this.prometheusService.getCounter(
      'http_requests_total',
      'Total number of HTTP requests',
      ['method', 'path', 'status'],
    );

    this.httpRequestDuration = this.prometheusService.getHistogram(
      'http_request_duration_seconds',
      'HTTP request duration in seconds',
      ['method', 'path', 'status'],
    );

    this.httpRequestsActive = this.prometheusService.getGauge(
      'http_requests_active',
      'Number of currently active HTTP requests',
      ['method', 'path'],
    );
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Skip metrics endpoint
    if (req.path === '/metrics') {
      return next();
    }

    const startTime = Date.now();
    const path = this.normalizePath(req.route?.path || req.path);
    const method = req.method.toLowerCase();

    // Increment active requests
    this.httpRequestsActive.inc({ method, path });

    // Track response metrics
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const status = res.statusCode.toString();

      this.httpRequestsTotal.inc({ method, path, status });
      this.httpRequestDuration.observe({ method, path, status }, duration);
      this.httpRequestsActive.dec({ method, path });
    });

    next();
  }

  private normalizePath(path: string): string {
    // Convert path parameters to generic form
    // e.g., /users/123 -> /users/:id
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(/^\/|\/$/g, '') // Remove leading/trailing slashes
      .replace(/[^a-zA-Z0-9_:/.-]/g, '_') // Replace invalid chars
      .toLowerCase();
  }
}
