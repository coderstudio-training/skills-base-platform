import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Logger, LoggingInterceptor } from '@skills-base/shared';
import { GrafanaWebhookPayload } from '../interfaces/grafana-webhook.interface';
import { EmailService } from './email.service';

@Controller('email')
@UseInterceptors(LoggingInterceptor)
export class EmailController {
  constructor(
    private emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  @Post('grafananotif')
  async handleGrafanaAlert(
    @Body() webhook: GrafanaWebhookPayload,
  ): Promise<{ message: string }> {
    this.logger.info('Received Grafana alert webhook', {
      title: webhook.title,
      status: webhook.status,
      alertCount: webhook.alerts.length,
    });

    try {
      const firstAlert = webhook.alerts[0];
      const alertData = {
        alert: webhook.title || firstAlert.labels.alertname,
        value: firstAlert.valueString || webhook.state,
        description:
          webhook.commonAnnotations.summary ||
          firstAlert.annotations.description ||
          webhook.message,
        status: webhook.status,
        startsAt: firstAlert.startsAt,
        instance: firstAlert.labels.instance,
        silenceUrl: firstAlert.silenceURL,
        viewUrl: firstAlert.dashboardURL || webhook.externalURL,
      };

      this.logger.debug('Processed alert data', { alertData });

      await this.emailService.sendGrafanaAlert(alertData);
      return { message: 'Grafana alert email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to process Grafana webhook', {
        error: error instanceof Error ? error.message : String(error),
        webhookTitle: webhook.title,
      });
      throw new BadRequestException('Failed to process Grafana alert.');
    }
  }
}
