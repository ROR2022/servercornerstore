import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/entities/user.entity';
import { DatabaseModule } from 'src/database/database.module';
import { AppService } from 'src/app.service';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthorizationService, AppService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
