import { Injectable } from '@nestjs/common';
import { sendConfimCodeMailer } from './lib/libMailer';

@Injectable()
export class MailerService {
  async sendConfimCode(email: string) {
    const code = this.createRandomCode();
    //const response =
    await sendConfimCodeMailer(email, code);
    //console.log('response(serviceSendConfirmCode):..', response);
    //console.log('code(service):..', code);
    return code;
  }

  createRandomCode() {
    return Math.floor(1000 + Math.random() * 9000);
  }
}
