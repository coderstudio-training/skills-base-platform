import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  PayloadTooLargeException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../security-monitoring.service';

interface ValidationConfig {
  payload: {
    maxSize: number; // in bytes
    allowedContentTypes: string[];
  };
  headers: {
    required: string[];
    forbidden: string[];
  };
  patterns: {
    // Common attack patterns to check for
    sql: RegExp[];
    xss: RegExp[];
    paths: RegExp[];
    commands: RegExp[];
  };
  sanitization: {
    enabled: boolean;
    allowedTags: string[];
    allowedAttributes: Record<string, string[]>;
  };
}

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  private readonly defaultConfig: ValidationConfig = {
    payload: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedContentTypes: [
        'application/json',
        'application/x-www-form-urlencoded',
        'multipart/form-data',
      ],
    },
    headers: {
      required: ['content-type'],
      forbidden: ['x-powered-by', 'server'],
    },
    patterns: {
      sql: [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
        /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
        /union\s+select/i,
      ],
      xss: [
        /<script[^>]*>[\s\S]*?<\/script>/i,
        /javascript:[^\n]*/i,
        /on\w+\s*=/i,
        /<iframe[^>]*>[\s\S]*?<\/iframe>/i,
      ],
      paths: [
        /\.\./g, // Directory traversal
        /\/etc\/passwd/i,
        /\/etc\/shadow/i,
        /\/proc\/self/i,
      ],
      commands: [
        /\$\{.*\}/g, // Template injection
        /\`.*\`/g, // Command injection
        /system\(.+\)/i,
        /eval\(.+\)/i,
      ],
    },
    sanitization: {
      enabled: true,
      allowedTags: [],
      allowedAttributes: {},
    },
  };

  constructor(
    private readonly securityMonitoring: SecurityMonitoringService,
    private readonly config: ValidationConfig = {} as ValidationConfig,
  ) {
    this.config = {
      ...this.defaultConfig,
      ...config,
      patterns: {
        ...this.defaultConfig.patterns,
        ...config.patterns,
      },
    };
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await this.validateRequest(req);
      next();
    } catch (error) {
      this.handleValidationError(error, req, res);
    }
  }

  private async validateRequest(req: Request): Promise<void> {
    const validations = [
      this.validatePayloadSize.bind(this),
      this.validateContentType.bind(this),
      this.validateHeaders.bind(this),
      this.validatePatterns.bind(this),
      this.sanitizeContent.bind(this),
    ];

    for (const validation of validations) {
      await validation(req);
    }
  }

  private async validatePayloadSize(req: Request): Promise<void> {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > this.config.payload.maxSize) {
      await this.securityMonitoring.trackThreatEvent(
        SecurityEventType.PAYLOAD_TOO_LARGE,
        {
          ipAddress: req.ip ?? 'UNKNOWN IP',
          path: req.path,
          method: req.method,
          metadata: {
            size: contentLength,
            limit: this.config.payload.maxSize,
            contentType: req.headers['content-type'],
          },
        },
      );

      throw new PayloadTooLargeException('Request payload too large');
    }
  }

  private async validateContentType(req: Request): Promise<void> {
    if (
      req.method === 'POST' ||
      req.method === 'PUT' ||
      req.method === 'PATCH'
    ) {
      const contentType = req.headers['content-type']?.split(';')[0];

      if (
        !contentType ||
        !this.config.payload.allowedContentTypes.includes(contentType)
      ) {
        await this.securityMonitoring.trackThreatEvent(
          SecurityEventType.INVALID_REQUEST,
          {
            ipAddress: req.ip ?? 'UNKNOWN IP',
            path: req.path,
            method: req.method,
            metadata: {
              contentType,
              allowedTypes: this.config.payload.allowedContentTypes,
            },
          },
        );

        throw new BadRequestException('Invalid content type');
      }
    }
  }

  private async validateHeaders(req: Request): Promise<void> {
    // Check for required headers
    for (const header of this.config.headers.required) {
      if (!req.headers[header]) {
        await this.securityMonitoring.trackThreatEvent(
          SecurityEventType.INVALID_REQUEST,
          {
            ipAddress: req.ip ?? 'UNKNOWN IP',
            path: req.path,
            method: req.method,
            metadata: {
              missingHeader: header,
            },
          },
        );

        throw new BadRequestException(`Missing required header: ${header}`);
      }
    }

    // Check for forbidden headers
    for (const header of this.config.headers.forbidden) {
      if (req.headers[header]) {
        await this.securityMonitoring.trackThreatEvent(
          SecurityEventType.SUSPICIOUS_REQUEST_PATTERN,
          {
            ipAddress: req.ip ?? 'UNKNOWN IP',
            path: req.path,
            method: req.method,
            metadata: {
              forbiddenHeader: header,
            },
          },
        );

        throw new BadRequestException(`Forbidden header detected: ${header}`);
      }
    }
  }

  private async validatePatterns(req: Request): Promise<void> {
    const content = this.getRequestContent(req);
    const contentStr =
      typeof content === 'string' ? content : JSON.stringify(content);

    // Check all pattern types
    for (const [patternType, patterns] of Object.entries(
      this.config.patterns,
    )) {
      for (const pattern of patterns) {
        if (pattern.test(contentStr)) {
          await this.securityMonitoring.trackThreatEvent(
            SecurityEventType.MALICIOUS_PAYLOAD,
            {
              ipAddress: req.ip ?? 'UNKNOWN IP',
              path: req.path,
              method: req.method,
              metadata: {
                patternType,
                pattern: pattern.toString(),
                matchedContent: contentStr.substring(0, 100), // Only log first 100 chars
              },
            },
          );

          throw new BadRequestException('Malicious content detected');
        }
      }
    }
  }

  private async sanitizeContent(req: Request): Promise<void> {
    if (!this.config.sanitization.enabled) return;

    const content = this.getRequestContent(req);
    if (typeof content === 'string') {
      req.body = this.sanitizeValue(content);
    } else if (typeof content === 'object' && content !== null) {
      req.body = this.sanitizeObject(content);
    }
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeValue(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeValue(value: string): string {
    return sanitizeHtml(value, {
      allowedTags: this.config.sanitization.allowedTags,
      allowedAttributes: this.config.sanitization.allowedAttributes,
    });
  }

  private getRequestContent(req: Request): any {
    return req.body || req.query || req.params || '';
  }

  private handleValidationError(error: any, req: Request, res: Response): void {
    const status = error.status || 400;
    const message = error.message || 'Validation Error';

    res.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
