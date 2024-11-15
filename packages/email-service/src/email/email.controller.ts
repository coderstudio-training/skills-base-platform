import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  Logger,
  LoggingInterceptor,
  MetricsInterceptor,
  TrackMetric,
} from '@skills-base/shared';
import { GrafanaWebhookPayload } from '../interfaces/grafana-webhook.interface';
import { EmailService } from './email.service';

@Controller('email')
@UseInterceptors(LoggingInterceptor, MetricsInterceptor)
export class EmailController {
  constructor(
    private emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  @Post('grafananotif')
  @TrackMetric({
    name: 'grafana_webhook_received',
    eventType: 'grafana.webhook',
  })
  async handleGrafanaAlert(
    @Body() webhook: GrafanaWebhookPayload,
  ): Promise<{ message: string }> {
    const correlationId = Math.random().toString(36).substring(7);

    this.logger.info('Received Grafana alert webhook', {
      correlationId,
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

      this.logger.debug('Processed alert data', {
        correlationId,
        alertData,
      });

      await this.emailService.sendGrafanaAlert(alertData);

      this.logger.info('Grafana alert processed successfully', {
        correlationId,
        title: webhook.title,
      });

      return { message: 'Grafana alert email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to process Grafana webhook', {
        correlationId,
        error: error instanceof Error ? error.message : String(error),
        webhookTitle: webhook.title,
      });

      throw new BadRequestException('Failed to process Grafana alert.');
    }
  }
}
