import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
//import exp from 'constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly configService: ConfigService,
  ) {
    const JWT_SECRET = configService.get<string>('JWT_SECRET');
    const JWT_EXPIRESIN = configService.get<string>('JWT_EXPIRESIN');
    //console.log('jwt.strategy JWT_SECRET:..',JWT_SECRET);
    //console.log('jwt.strategy JWT_EXPIRESIN:..',JWT_EXPIRESIN);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
      expiresIn: JWT_EXPIRESIN,
    });
  }
  

  async validate(payload: any) {
    //console.log('jwt.strategy validate payload:..',payload);
    return {
      userId: payload.userId,
      email: payload.email,
      userRoles: payload.userRoles,
    };
  }
}
