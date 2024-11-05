import { ValidatorOptions } from 'class-validator';
import { ThrottlerOptions } from '@nestjs/throttler';

export interface SecurityConfig {
  rateLimit?: ThrottlerOptions;
  cors?: {
    origin: string | string[];
    methods?: string[];
    credentials?: boolean;
  };
  helmet?: {
    hidePoweredBy?: boolean;
    noSniff?: boolean;
    xssFilter?: boolean;
    frameguard?: boolean;
    hsts?: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
  };
  validation?: ValidatorOptions & {
    transformOptions?: {
      enableImplicitConversion?: boolean;
    };
  };
  security?: {
    enableXssProtection?: boolean;
    enableMongoSanitization?: boolean;
    maxRequestSize?: string;
    rateLimitExceptions?: string[];
  };
}
