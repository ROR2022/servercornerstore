import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {

   listRoles = [
    'adminRoot',
    'businessOwner',
    'client',
    'manager',
    'cashier',
    'supervisor',
    'handyman',
    'branch',
  ]

  constructor(private configService: ConfigService) {}



  getDataEnv() {
    const URI_MONGODB = this.configService.get<string>('URI_MONGODB');
    const app_port = this.configService.get<string>('PORT');
    const AWS_ACCESSKEYID = this.configService.get<string>('AWS_ACCESSKEYID');
    const AWS_BUCKETNAME = this.configService.get<string>('AWS_BUCKETNAME');
    const AWS_SECRETACCESSKEY = this.configService.get<string>('AWS_SECRETACCESSKEY'); 
    const AWS_REGION = this.configService.get<string>('AWS_REGION');
    const JWT_SECRET = this.configService.get<string>('JWT_SECRET');
    const VAPID_PUBLIC_KEY = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const BCRYPT_SALT = this.configService.get<string>('BCRYPT_SALT');
    const STRIPE_SECRET_KEY = this.configService.get<string>('STRIPE_SECRET_KEY');
    const STRIPE_SECRET_KEY_DEV = this.configService.get<string>('STRIPE_SECRET_KEY_DEV');

    return {
      URI_MONGODB,
      app_port,
      AWS_ACCESSKEYID,
      AWS_BUCKETNAME,
      AWS_SECRETACCESSKEY,
      AWS_REGION,
      JWT_SECRET,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY,
      BCRYPT_SALT,
      STRIPE_SECRET_KEY,
      STRIPE_SECRET_KEY_DEV
    };
  }

  getHello(): string {
    return 'Welcome to CornerStoreAPI RorApp......';
  }
}
