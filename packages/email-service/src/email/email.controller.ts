import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() body: { to: string; name: string }): Promise<{ message: string }> {
    const { to, name } = body;
    await this.emailService.sendWelcomeEmail(to, name);
    return { message: 'Email sent successfully' };
  }
}
