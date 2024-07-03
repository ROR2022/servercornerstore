import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
    constructor(
        // eslint-disable-next-line prettier/prettier
        private readonly mailerService: MailerService,
    ) {}

    @Post('sendConfimCode')
    async sendConfimCode(@Body() body: any) {
        //console.log('body SendConfirmCode:..', body);
        const { email } = body;
        const code = await this.mailerService.sendConfimCode(email);
        //console.log('code(controller):..', code);
        return { code };
    }
}
