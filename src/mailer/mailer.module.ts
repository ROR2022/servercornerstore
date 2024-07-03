import { Module } from '@nestjs/common';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  controllers: [MailerController],
  providers: [MailerService]
})
export class MailerModule {}
