import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { AppService } from 'src/app.service';

@Module({
  controllers: [StripeController],
  providers: [StripeService, AppService],
})
export class StripeModule {}
