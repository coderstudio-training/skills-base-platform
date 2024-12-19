import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import {
  SecurityEventType,
  SecurityMonitoringService,
} from './security-monitoring.service';

export interface GoogleAuthConfig {
  allowedDomains?: string[];
  requireVerifiedEmail?: boolean;
  maxTokenAge?: number; // in seconds
}

@Injectable()
export class GoogleAuthSecurityService {
  private readonly googleClient: OAuth2Client;
  private readonly logger = new Logger(GoogleAuthSecurityService.name);
  private readonly config: GoogleAuthConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly securityMonitoring: SecurityMonitoringService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      this.logger.error('Google Client ID is not defined');
      throw new InternalServerErrorException('Google Client ID is not defined');
    }

    this.googleClient = new OAuth2Client(clientId);
    this.config = {
      allowedDomains: this.configService
        .get<string>('GOOGLE_ALLOWED_DOMAINS')
        ?.split(','),
      requireVerifiedEmail: this.configService.get<boolean>(
        'GOOGLE_REQUIRE_VERIFIED_EMAIL',
        true,
      ),
      maxTokenAge: this.configService.get<number>('GOOGLE_MAX_TOKEN_AGE', 300), // 5 minutes default
    };
  }

  async verifyToken(
    token: string,
    requestIp: string,
    customConfig?: Partial<GoogleAuthConfig>,
  ): Promise<TokenPayload> {
    const config = { ...this.config, ...customConfig };

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token: empty payload');
      }

      // Validate token claims
      await this.validateTokenClaims(payload, config, requestIp);

      return payload;
    } catch (error) {
      await this.handleVerificationError(error, token, requestIp);
      throw error;
    }
  }

  private async validateTokenClaims(
    payload: TokenPayload,
    config: GoogleAuthConfig,
    requestIp: string,
  ): Promise<void> {
    // Check if email is present
    if (!payload.email) {
      await this.trackSecurityEvent('MISSING_EMAIL', requestIp, payload);
      throw new UnauthorizedException('Email not provided in token');
    }

    // Verify email if required
    if (config.requireVerifiedEmail && !payload.email_verified) {
      await this.trackSecurityEvent('UNVERIFIED_EMAIL', requestIp, payload);
      throw new UnauthorizedException('Email address not verified');
    }

    // Check domain restrictions
    if (
      config.allowedDomains?.length &&
      (!payload.hd || !config.allowedDomains.includes(payload.hd))
    ) {
      await this.trackSecurityEvent('INVALID_DOMAIN', requestIp, payload);
      throw new UnauthorizedException('Invalid email domain');
    }

    // Validate token age
    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - (payload.iat || 0);
    if (tokenAge > config.maxTokenAge!) {
      await this.trackSecurityEvent('TOKEN_EXPIRED', requestIp, payload);
      throw new UnauthorizedException('Token has expired');
    }
  }

  private async handleVerificationError(
    error: any,
    token: string,
    requestIp: string,
  ): Promise<void> {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    this.logger.error(`Token verification failed: ${errorMessage}`, {
      requestIp,
      error,
    });

    await this.securityMonitoring.trackThreatEvent(
      SecurityEventType.UNAUTHORIZED_IP,
      {
        ipAddress: requestIp,
        path: '/auth/google',
        method: 'POST',
        metadata: {
          error: errorMessage,
          tokenLength: token.length,
        },
      },
    );

    if (!(error instanceof UnauthorizedException)) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private async trackSecurityEvent(
    type: string,
    requestIp: string,
    payload: TokenPayload,
  ): Promise<void> {
    await this.securityMonitoring.trackThreatEvent(
      SecurityEventType.INVALID_REQUEST,
      {
        ipAddress: requestIp,
        path: '/auth/google',
        method: 'POST',
        metadata: {
          validationType: type,
          email: payload.email,
          domain: payload.hd,
        },
      },
    );
  }
}
