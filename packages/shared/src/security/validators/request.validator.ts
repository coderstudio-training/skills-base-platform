import { Injectable, PayloadTooLargeException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class RequestValidator {
  static validatePayloadSize(maxSize: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > maxSize) {
        throw new PayloadTooLargeException();
      }
      next();
    };
  }

  static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return sanitizeHtml(data, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeInput(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  }
}
