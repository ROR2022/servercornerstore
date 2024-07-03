import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // eslint-disable-next-line prettier/prettier
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('LocalStrategy:validate email:...', email);
    console.log('LocalStrategy:validate password:...', password);
    const user = await this.authService.validateUser(email, password);
    console.log('LocalStrategy:validate user:...', user);
    if (user === null || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
