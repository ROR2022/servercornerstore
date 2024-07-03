import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy/local.strategy';
import { User, UserSchema } from '../users/entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as dotenv from 'dotenv';
import { UsersService } from 'src/users/users.service';
import { AppService } from 'src/app.service';

dotenv.config();
//import { JWT_SECRET, JWT_EXPIRESIN } from 'src/main';
//importaremos el JWT_SECRET y JWT_EXPIRESIN  de nuestro archivo .env para que no estén expuestos en el código

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRESIN;
//console.log('auth.module jwtSecret:...', jwtSecret);
//console.log('auth.module jwtExpiresIn:...', jwtExpiresIn);

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    UsersService,
    AppService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
