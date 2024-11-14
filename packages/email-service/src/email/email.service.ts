import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@skills-base/shared';
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
      this.logger.warn('No admin emails configured, using default');
      return ['admin@example.com']; // Default fallback
    }
    return emails.split(',').map((email) => email.trim());
  }

  async sendGrafanaAlert(alertData: any): Promise<void> {
    this.logger.debug('Preparing to send Grafana alert email...', {
      alertData,
    });

    try {
      // Add more context to the template data
      const templateData = {
        ...alertData,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      };

      const html = await this.getEmailTemplate(
        'grafana-alert-template',
        templateData,
      );

      const mailOptions = {
        from:
          this.configService.get<string>('EMAIL_SENDER') ||
          'alerts@example.com',
        to: this.adminEmails.join(','),
        subject: `Grafana Alert: ${alertData.alert}`,
        html: html,
      };

      this.logger.debug('Sending email with options:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
      });

      await this.transporter.sendMail(mailOptions);
      this.logger.info('Grafana alert email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send Grafana alert email', {
        error: error instanceof Error ? error.message : String(error),
        alertData,
        template: 'grafana-alert-template',
      });
      throw new InternalServerErrorException(
        'Failed to send Grafana alert email',
      );
    }
  }

  private async getEmailTemplate(
    templateName: string,
    data: any,
  ): Promise<string> {
    this.logger.info('Loading email template:', { templateName });
    try {
      // Fix: Use proper path resolution for templates
      const templatePath = join(
        process.cwd(),
        'dist',
        'src',
        'templates',
        `${templateName}.html`,
      );

      this.logger.debug('Attempting to load template from path:', {
        templatePath,
      });

      const templateSource = readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      this.logger.error('Failed to load email template', {
        error: error instanceof Error ? error.message : String(error),
        templateName,
      });
      throw new InternalServerErrorException(
        `Error loading template: ${templateName}`,
      );
    }
  }
}
