import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as dotenv from 'dotenv';

dotenv.config();
//import { setCorsBucket } from './lib/awsLib';
const mongoKey = process.env.URI_MONGODB;
console.log('mongoKey(main.ts):..', mongoKey);

const configService = new ConfigService();
const app_port = configService.get<string>('PORT') || process.env.PORT || 3000;
const JWT_SECRET =
  configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'secret';
const JWT_EXPIRESIN =
  configService.get<string>('JWT_EXPIRESIN') ||
  process.env.JWT_EXPIRESIN ||
  '24h';

async function bootstrap() {
  //convertimos el tiempo de expiracion a milisegundos sabiendo el formato de la cadena expresado en horas y eliminando el ultimo caracter que es la letra "h"
  const JWT_EXPIRESIN_MS =
    parseInt(JWT_EXPIRESIN?.slice(0, -1)) * 60 * 60 * 1000;

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(
    session({
      secret: JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: JWT_EXPIRESIN_MS,
      },
    }),
  );
  await app.listen(app_port);
  //await setCorsBucket();
}
bootstrap();
