import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AppService } from 'src/app.service';
import * as dotenv from 'dotenv';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

dotenv.config();
//import { JWT_SECRET, JWT_EXPIRESIN } from 'src/main';
//importaremos el JWT_SECRET y JWT_EXPIRESIN  de nuestro archivo .env para que no estén expuestos en el código

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRESIN;

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, AppService, AuthorizationService, UsersService],
})
export class ProductModule {}
