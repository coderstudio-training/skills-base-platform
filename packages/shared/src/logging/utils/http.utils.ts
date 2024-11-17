import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContext } from '../types';

export class HttpContextUtils {
  static normalizeUrl(url: string): string {
    return url
      .replace(/\/\d+/g, '/:id')
      .replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '/:uuid',
      )
      .split('?')[0];
  }

  static getResponseSize(res: Response): number {
    const size = res.getHeader('content-length');
    return size ? parseInt(size.toString(), 10) : 0;
  }

  static getRequestContext(request: Request): RequestContext {
    const user = (request.user as any) || {};
    const timestamp = new Date().toISOString();

    return {
      method: request.method,
      path: this.normalizeUrl(request.originalUrl || request.url),
      correlationId:
        request.headers['x-correlation-id']?.toString() || uuidv4(),
      userId: user.id,
      userAgent: request.get('user-agent'),
      ip: request.ip,
      query: request.query,
      params: request.params,
      // Exclude sensitive data from body logging
      body: this.sanitizeRequestBody(request.body),
      timestamp,
    };
  }

  private static sensitiveFields = new Set([
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
  ]);

  private static sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (this.sensitiveFields.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeRequestBody(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
