import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { AppService } from 'src/app.service';
import * as dotenv from 'dotenv';

dotenv.config();
//import { JWT_SECRET, JWT_EXPIRESIN } from 'src/main';
//importaremos el JWT_SECRET y JWT_EXPIRESIN  de nuestro archivo .env para que no estén expuestos en el código

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRESIN;

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthorizationService, AppService],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
