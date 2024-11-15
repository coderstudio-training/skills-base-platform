import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger, TrackMetric } from '@skills-base/shared';
import { readFileSync } from 'fs';
import * as handlebars from 'handlebars';
import { createTransport, Transporter } from 'nodemailer';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private adminEmails: string[];
  private readonly logger: Logger;

  constructor(
    private configService: ConfigService,
    logger: Logger,
  ) {
    this.logger = logger;
    this.initializeService();
  }

  private initializeService(): void {
    try {
      this.transporter = this.createTransporter();
      this.adminEmails = this.getAdminEmails();

      this.logger.info('Email service initialized successfully', {
        adminEmailCount: this.adminEmails.length,
        smtpHost: 'localhost',
        smtpPort: 1025,
      });
    } catch (error) {
      this.logger.error('Failed to initialize email service', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private createTransporter(): Transporter {
    const transportConfig = {
      host: 'localhost',
      port: 1025,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    };

    this.logger.debug('Creating SMTP transporter', { config: transportConfig });
    return createTransport(transportConfig);
  }

  private getAdminEmails(): string[] {
    const emails = this.configService.get<string>('ADMIN_EMAILS');
    if (!emails) {
      this.logger.warn('No admin emails configured, using default');
      return ['admin@example.com'];
    }
    return emails.split(',').map((email) => email.trim());
  }

  @TrackMetric({ eventType: 'email.grafana.alert' })
  async sendGrafanaAlert(alertData: any): Promise<void> {
    const correlationId = Math.random().toString(36).substring(7);

    this.logger.info('Preparing to send Grafana alert email', {
      correlationId,
      alertTitle: alertData.alert,
      recipients: this.adminEmails.length,
    });

    try {
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

      this.logger.debug('Sending email', {
        correlationId,
        subject: mailOptions.subject,
        recipientCount: this.adminEmails.length,
      });

      await this.transporter.sendMail(mailOptions);

      this.logger.info('Grafana alert email sent successfully', {
        correlationId,
        alertId: alertData.alert,
      });
    } catch (error) {
      this.logger.error('Failed to send Grafana alert email', {
        correlationId,
        error: error instanceof Error ? error.message : String(error),
        alertData,
        template: 'grafana-alert-template',
      });

      throw new InternalServerErrorException(
        'Failed to send Grafana alert email',
      );
    }
  }

  @TrackMetric({ eventType: 'email.template.load' })
  private async getEmailTemplate(
    templateName: string,
    data: any,
  ): Promise<string> {
    const startTime = Date.now();

    this.logger.debug('Loading email template', {
      templateName,
      dataKeys: Object.keys(data),
    });

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
      const result = template(data);

      const duration = Date.now() - startTime;
      this.logger.debug('Template loaded and compiled successfully', {
        templateName,
        duration,
        outputSize: result.length,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to load email template', {
        error: error instanceof Error ? error.message : String(error),
        templateName,
        duration: Date.now() - startTime,
      });

      throw new InternalServerErrorException(
        `Error loading template: ${templateName}`,
      );
    }
  }
}
