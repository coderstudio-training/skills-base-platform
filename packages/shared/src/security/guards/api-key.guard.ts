import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SecurityConfig } from '../types';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private config: SecurityConfig) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.config.apiKey.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const path = request.route.path;

    if (this.config.apiKey.excludePaths?.includes(path)) {
      return true;
    }

    const apiKey = request.headers['x-api-key'];
    return this.config.apiKey.keys.includes(apiKey);
  }
}
