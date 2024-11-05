import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly MAX_REQUEST_SIZE = '10mb';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Check request size
    const contentLength = request.headers['content-length'];
    if (
      contentLength &&
      parseInt(contentLength) > this.parseSize(this.MAX_REQUEST_SIZE)
    ) {
      throw new BadRequestException('Request entity too large');
    }

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-Frame-Options', 'SAMEORIGIN');
        response.setHeader('X-XSS-Protection', '1; mode=block');
        response.setHeader(
          'Referrer-Policy',
          'strict-origin-when-cross-origin',
        );
        response.setHeader('Content-Security-Policy', "default-src 'self'");
      }),
    );
  }

  private parseSize(size: string): number {
    const units = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024,
    };
    const match = size.match(/^(\d+)(\w+)$/);
    if (!match) return 0;
    const [, value, unit] = match;
    return parseInt(value) * units[unit.toLowerCase() as keyof typeof units];
  }
}
