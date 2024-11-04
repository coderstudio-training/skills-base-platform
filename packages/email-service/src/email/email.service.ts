import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { createTransport, Transporter } from 'nodemailer';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private adminEmails: string[];
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = this.createTransporter();
    this.adminEmails = this.getAdminEmails();
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

  private getAdminEmails(): string[] {
    const emails = this.configService.get<string>('ADMIN_EMAILS');
    if (!emails) {
      throw new Error('Admin email/s not found');
    }
    return emails.split(',').map((email) => email.trim());
  }

  private async getEmailTemplate(
    templateName: string,
    data: string,
  ): Promise<string> {
    this.logger.log('Loading email templates...');
    try {
      const templatePath = join(
        __dirname,
        '..',
        'src/templates',
        `${templateName}.html`,
      );
      const templateSource = readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      return template(JSON.parse(data));
    } catch (error) {
      this.logger.error(
        `Failed to load email template: ${templateName}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Error loading template: ${templateName}`,
      );
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    data: string,
  ): Promise<void> {
    const html = await this.getEmailTemplate(templateName, data);
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_SENDER'),
      to: to,
      subject: subject,
      html: html,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendSuccessEmail(workflowName: string): Promise<void> {
    this.logger.log('Sending success email...');
    try {
      const data = JSON.stringify({ workflowName });
      await this.sendEmail(
        this.adminEmails.join(','),
        'Workflow Successful!',
        'success-email-template',
        data,
      );
      this.logger.log('Success email sent successfully');
    } catch (error) {
      this.logger.error(
        `Failed to send success email for workflow: ${workflowName}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to send success email.');
    }
  }

  async sendErrorEmail(workflowName: string): Promise<void> {
    this.logger.log('Sending error email...');
    try {
      const data = JSON.stringify({ workflowName });
      await this.sendEmail(
        this.adminEmails.join(','),
        'Workflow Failed!',
        'error-email-template',
        data,
      );
      this.logger.log('Error email sent successfully');
    } catch (sendError) {
      this.logger.error(
        `Failed to send failure email for workflow: ${workflowName}`,
        sendError.stack,
      );
      throw new InternalServerErrorException('Failed to send fail email.');
    }
  }
}
