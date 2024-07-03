import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
//import exp from 'constants';

const jwtSecret = process.env.JWT_SECRET || 'secret';
const jwtExpiresIn = process.env.JWT_EXPIRESIN || '24h';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      expiresIn: jwtExpiresIn,
    });
    //const JWT_SECRET = this.configService.get<string>('JWT_SECRET');
    //const JWT_EXPIRESIN = this.configService.get<string>('JWT_EXPIRESIN');
    //console.log('jwt.strategy JWT_SECRET:..',JWT_SECRET);
    //console.log('jwt.strategy JWT_EXPIRESIN:..',JWT_EXPIRESIN);
    
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
