import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
//import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { ProtectedController } from './protected/protected.controller';
import { AuthorizationService } from './authorization/authorization.service';
import { MailerModule } from './mailer/mailer.module';
import { MailerService } from './mailer/mailer.service';
import { MulterModule } from '@nestjs/platform-express';
import { ProductModule } from './product/product.module';
import { VentasModule } from './ventas/ventas.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    UsersModule,
    DatabaseModule,
    AuthModule,
    AuthorizationModule,
    MailerModule,
    ProductModule,
    VentasModule,
    StripeModule,
  ],
  controllers: [AppController, ProtectedController],
  providers: [AppService, AuthorizationService, MailerService, DatabaseModule],
  exports: [DatabaseModule, AuthorizationModule, MailerModule],
})
export class AppModule {}
