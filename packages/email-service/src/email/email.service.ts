import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@skills-base/shared';
import { readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { createTransport, Transporter } from 'nodemailer';
import { join } from 'path';
import { EmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private adminEmails: string[];

  constructor(
    private configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.logger = new Logger(EmailService.name);
    this.initializeService();
  }

  private initializeService(): void {
    this.logger.info('Initializing email service');

    try {
      this.transporter = createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.adminEmails = this.configService
        .get<string>('ADMIN_EMAILS')
        ?.split(',') || ['admin@example.com'];

      this.logger.info('Email service initialized', {
        recipientCount: this.adminEmails.length,
        smtpConfig: { host: 'localhost', port: 1025 },
      });
    } catch (error) {
      this.logger.error('Failed to initialize email service', { error });
      throw error;
    }
  }

  async sendWorkflowSuccess(data: EmailDto): Promise<void> {
    this.logger.info('Sending workflow success email', {
      workflowName: data.workflowName,
    });

    try {
      const html = await this.getEmailTemplate('success-email-template', data);

      await this.transporter.sendMail({
        from:
          this.configService.get<string>('EMAIL_SENDER') ||
          'noreply@example.com',
        to: this.adminEmails.join(','),
        subject: `Workflow Success: ${data.workflowName}`,
        html,
      });

      this.logger.info('Workflow success email sent', {
        workflowName: data.workflowName,
        recipients: this.adminEmails.length,
      });
    } catch (error) {
      this.logger.error('Failed to send workflow success email', {
        error,
        workflowName: data.workflowName,
      });
      throw new InternalServerErrorException('Failed to send success email');
    }
  }

  async sendWorkflowError(data: EmailDto): Promise<void> {
    this.logger.info('Sending workflow error email', {
      workflowName: data.workflowName,
    });

    try {
      const html = await this.getEmailTemplate('error-email-template', data);

      await this.transporter.sendMail({
        from:
          this.configService.get<string>('EMAIL_SENDER') ||
          'noreply@example.com',
        to: this.adminEmails.join(','),
        subject: `Workflow Error: ${data.workflowName}`,
        html,
      });

      this.logger.info('Workflow error email sent', {
        workflowName: data.workflowName,
        recipients: this.adminEmails.length,
      });
    } catch (error) {
      this.logger.error('Failed to send workflow error email', {
        error,
        workflowName: data.workflowName,
      });
      throw new InternalServerErrorException('Failed to send error email');
    }
  }

  private async getEmailTemplate(
    templateName: string,
    data: any,
  ): Promise<string> {
    this.logger.debug('Loading email template', { templateName });

    try {
      const templatePath = join(
        process.cwd(),
        'dist',
        'src',
        'templates',
        `${templateName}.html`,
      );

      const templateSource = readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      this.logger.error('Failed to load email template', {
        error,
        templateName,
      });
      throw new InternalServerErrorException(
        `Error loading template: ${templateName}`,
      );
    }
  }
}
