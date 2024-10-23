import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { createTransport, Transporter } from 'nodemailer';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): Transporter {
    return createTransport({
      host: 'localhost', 
      port: 1025,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private async getEmailTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = join(__dirname,'..', 'src/templates', `${templateName}.html`);
    const templateSource = readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    return template(data);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = await this.getEmailTemplate('welcome', { name });
    const mailOptions = {
      from: 'stratpoint@gmail.com',
      to: to,
      subject: 'Welcome!',
      html: html,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
