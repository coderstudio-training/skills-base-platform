import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import {
  InvalidContentTypeException,
  InvalidHeaderException,
  MaliciousContentException,
  PayloadTooLargeException,
} from '../exceptions/security-validator.exceptions';
import {
  SecurityConfig,
  ValidationConfig,
} from '../interfaces/security.interfaces';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from '../services/security-monitoring.service';

@Injectable()
export class SecurityValidationMiddleware implements NestMiddleware {
  private readonly config: ValidationConfig;
  // Cache for compiled patterns
  private cachedPatterns: Map<string, RegExp> | null = null;
  // Cache for sanitization options
  private readonly sanitizationOptions: sanitizeHtml.IOptions;
  // Methods that require content type validation
  private readonly METHODS_REQUIRING_CONTENT_TYPE = new Set([
    'POST',
    'PUT',
    'PATCH',
  ]);

  constructor(
    private readonly securityMonitoring: SecurityMonitoringService,
    @Inject('SECURITY_CONFIG') private readonly securityConfig: SecurityConfig,
  ) {
    this.config = {
      payload: {
        maxSize: this.securityConfig.payload.maxSize,
        allowedContentTypes: this.securityConfig.payload.allowedContentTypes,
      },
      headers: {
        required: ['content-type'],
        forbidden: ['x-powered-by', 'server'],
      },
      patterns: {
        sql: [
          /(%27)|(')|(--)|(%23)|(#)/i,
          /((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))/i,
          /\w*((%27)|(')|(%6F)|o|(%4F))((%72)|r|(%52))/i,
          /union\s+select/i,
        ],
        xss: [
          /<script[^>]*>[\s\S]*?<\/script>/i,
          /javascript:[^\n]*/i,
          /on\w+\s*=/i,
          /<iframe[^>]*>[\s\S]*?<\/iframe>/i,
        ],
        paths: [/\.\./g, /\/etc\/passwd/i, /\/etc\/shadow/i, /\/proc\/self/i],
        commands: [/\${.*}/g, /`.*`/g, /system\(.+\)/i, /eval\(.+\)/i],
      },
      sanitization: {
        enabled: true,
        allowedTags: [],
        allowedAttributes: {},
      },
    };

    // Initialize sanitization options once
    this.sanitizationOptions = {
      allowedTags: this.config.sanitization.allowedTags,
      allowedAttributes: this.config.sanitization.allowedAttributes,
    };
  }

  /**
   * Gets or creates cached validation patterns
   */
  private getValidationPatterns(): Map<string, RegExp> {
    if (!this.cachedPatterns) {
      // Combine patterns for each type into a single RegExp
      this.cachedPatterns = new Map(
        Object.entries(this.config.patterns).map(([type, patterns]) => [
          type,
          new RegExp(patterns.map((p) => p.source).join('|'), 'i'),
        ]),
      );
    }
    return this.cachedPatterns;
  }

  /**
   * Enhanced object sanitization with memoization
   */
  private sanitizeObject(
    obj: Record<string, any>,
    memo = new WeakMap(),
  ): Record<string, any> {
    // Handle circular references and memoization
    if (obj === null || typeof obj !== 'object') return obj;
    if (memo.has(obj)) return memo.get(obj);

    const sanitized: Record<string, any> = Array.isArray(obj) ? [] : {};
    memo.set(obj, sanitized);

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        sanitized[key] = value;
        continue;
      }

      switch (typeof value) {
        case 'string':
          sanitized[key] = this.sanitizeValue(value);
          break;
        case 'object':
          sanitized[key] = this.sanitizeObject(value, memo);
          break;
        default:
          sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitizes a single string value using cached sanitization options
   */
  private sanitizeValue(value: string): string {
    return sanitizeHtml(value, this.sanitizationOptions);
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

  private async validatePatterns(req: Request): Promise<void> {
    const content = this.getRequestContent(req);
    const contentStr =
      typeof content === 'string' ? content : JSON.stringify(content);
    const patterns = this.getValidationPatterns();

    for (const [patternType, pattern] of patterns) {
      if (pattern.test(contentStr)) {
        await this.securityMonitoring.trackThreatEvent(
          SecurityEventType.MALICIOUS_PAYLOAD,
          {
            ipAddress: req.ip ?? 'UNKNOWN IP',
            path: req.path,
            method: req.method,
            metadata: {
              patternType,
              matchedContent: contentStr.substring(0, 100),
            },
          },
        );
        throw new MaliciousContentException('Malicious content detected');
      }
    }
  }

  private async validatePayloadSize(req: Request): Promise<void> {
    // Skip validation for methods that typically don't have a payload
    if (['GET', 'DELETE', 'OPTIONS', 'HEAD'].includes(req.method)) {
      return;
    }

    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const transferEncoding = req.headers['transfer-encoding'];

    // Check for missing content-length when required
    if (!contentLength && !transferEncoding && req.method !== 'GET') {
      await this.securityMonitoring.trackThreatEvent(
        SecurityEventType.INVALID_REQUEST,
        {
          ipAddress: req.ip ?? 'UNKNOWN IP',
          path: req.path,
          method: req.method,
          metadata: {
            reason: 'Missing Content-Length header',
          },
        },
      );
      throw new BadRequestException('Missing Content-Length header');
    }

    // Handle chunked transfer encoding
    if (transferEncoding === 'chunked') {
      let actualSize = 0;
      if (req.body && typeof req.body === 'object') {
        actualSize = Buffer.byteLength(JSON.stringify(req.body));
      } else if (typeof req.body === 'string') {
        actualSize = Buffer.byteLength(req.body);
      }

      if (actualSize > this.config.payload.maxSize) {
        await this.reportSizeViolation(req, actualSize);
        throw new PayloadTooLargeException('Request payload too large');
      }
      return;
    }

    // Validate content-length header
    if (contentLength > this.config.payload.maxSize) {
      await this.reportSizeViolation(req, contentLength);
      throw new PayloadTooLargeException('Request payload too large');
    }

    // Additional validation for multipart/form-data
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      let totalSize = contentLength;

      // Add size of any files in the request
      const files = (req as any).files || {};
      for (const file of Object.values(files) as any[]) {
        if (file.size) {
          totalSize += file.size;
        }
      }

      if (totalSize > this.config.payload.maxSize) {
        await this.reportSizeViolation(req, totalSize);
        throw new PayloadTooLargeException(
          'Total request size including files too large',
        );
      }
    }
  }

  // Helper method to report size violations
  private async reportSizeViolation(req: Request, size: number): Promise<void> {
    await this.securityMonitoring.trackThreatEvent(
      SecurityEventType.PAYLOAD_TOO_LARGE,
      {
        ipAddress: req.ip ?? 'UNKNOWN IP',
        path: req.path,
        method: req.method,
        metadata: {
          size,
          limit: this.config.payload.maxSize,
          contentType: req.headers['content-type'],
          transferEncoding: req.headers['transfer-encoding'],
        },
      },
    );
  }

  private async validateContentType(req: Request): Promise<void> {
    if (!this.METHODS_REQUIRING_CONTENT_TYPE.has(req.method)) {
      return;
    }

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
      throw new InvalidContentTypeException('Invalid content type');
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

        throw new InvalidHeaderException(`Missing required header: ${header}`);
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

        throw new InvalidHeaderException(
          `Forbidden header detected: ${header}`,
        );
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

  private getRequestContent(req: Request): any {
    return req.body || req.query || req.params || '';
  }

  private handleValidationError(error: any, req: Request, res: Response): void {
    const status = error.status || 400;
    const message = error.message || 'Validation Error';
    const errorCode = error.code || 'VALIDATION_ERROR';

    this.securityMonitoring.trackThreatEvent(
      SecurityEventType.INVALID_REQUEST,
      {
        ipAddress: req.ip ?? 'UNKNOWN IP',
        path: req.path,
        method: req.method,
        metadata: {
          errorCode,
          validationType: error.validationType,
          originalError: error,
        },
      },
    );

    res.status(status).json({
      statusCode: status,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
