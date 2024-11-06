import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SecurityConfig } from '../types';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  constructor(private config: SecurityConfig) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.config.ipWhitelist.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clientIp = request.ip;

    return this.config.ipWhitelist.allowedIps.includes(clientIp);
  }
}
