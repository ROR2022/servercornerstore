import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const mongoURI = process.env.URI_MONGODB;
console.log('mongoURI(MongooseModule):..', mongoURI);

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: mongoURI || configService.get<string>('URI_MONGODB'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
