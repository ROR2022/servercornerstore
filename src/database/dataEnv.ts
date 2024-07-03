import * as dotenv from 'dotenv';
dotenv.config();

export class DataEnv {
  public URI_MONGODB: string;
  public PORT: string;
  public JWT_SECRET: string;
  public JWT_EXPIRESIN: string;

  constructor() {
    this.URI_MONGODB = process.env.URI_MONGODB || '';
    this.PORT = process.env.PORT || '3000';
    this.JWT_SECRET = process.env.JWT_SECRET || 'secret';
    this.JWT_EXPIRESIN = process.env.JWT_EXPIRESIN || '24h';
  }
}
