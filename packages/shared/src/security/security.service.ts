import { Injectable } from '@nestjs/common';
import { SecurityConfig } from './interfaces/security-config.interface';

@Injectable()
export class SecurityService {
  getHelmetConfig(config: SecurityConfig['helmet']) {
    return {
      hidePoweredBy: true,
      noSniff: true,
      xssFilter: true,
      frameguard: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ...config,
    };
  }

  getCorsConfig(config: SecurityConfig['cors']) {
    return {
      origin: config?.origin || '*',
      methods: config?.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: config?.credentials || true,
    };
  }
}
