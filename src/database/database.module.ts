import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from 'src/app.service';
import * as dotenv from 'dotenv';
dotenv.config();
import { DataEnv, dataMongoURI } from './dataEnv';

const dataEnvTemp = new DataEnv();
const myMongoURI = dataEnvTemp.URI_MONGODB;
console.log('myMongoURI(MongooseModule):..', myMongoURI);

const mongoURI = process.env.URI_MONGODB;
console.log('mongoURI(MongooseModule):..', mongoURI);
const appService = new AppService(new ConfigService());
const dataEnv = appService.getDataEnv();
const mongoKey = dataEnv.URI_MONGODB;
console.log('mongoKey(MongooseModule):..', mongoKey);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigModule esté disponible en toda la aplicación
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          dataMongoURI ||
          myMongoURI ||
          mongoKey ||
          mongoURI ||
          configService.get<string>('URI_MONGODB'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AppService],
})
export class DatabaseModule {}
