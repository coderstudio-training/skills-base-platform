import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_STRATEGY } from '../constants/auth.constants';
import { IJwtStrategy } from '../interfaces/jwt-strategy.interface';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy, JWT_STRATEGY)
  implements IJwtStrategy
{
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
