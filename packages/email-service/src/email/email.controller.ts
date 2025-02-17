import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  Logger,
  Roles,
  RolesGuard,
  TrackMetric,
  UserRole,
} from '@skills-base/shared';
import { GrafanaWebhookPayload } from '../interfaces/grafana-webhook.interface';
import { EmailDto } from './dto/email.dto';
import { EmailService } from './email.service';

@ApiTags('Email Notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('email')
export class EmailController {
  constructor(
    private emailService: EmailService,
    private readonly logger: Logger,
  ) {
    this.logger = new Logger(EmailController.name);
  }

  @Post('grafananotif')
  @TrackMetric({
    name: 'grafana_webhook_received',
    eventType: 'grafana.webhook',
  })
  @ApiOperation({
    summary: 'Handle Grafana alert webhook',
    description: 'Processes Grafana alerts and sends notification emails',
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

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-Admin')
  @Post('send-success')
  @TrackMetric({
    name: 'email_workflow_success',
    eventType: 'email_sent',
  })
  @ApiOperation({
    summary: 'Send workflow success notification',
    description:
      'Sends an email notification for successful workflow completion',
  })
  async sendWorkflowSuccess(
    @Body() data: EmailDto,
  ): Promise<{ message: string }> {
    this.logger.info('Received workflow success notification', {
      workflowName: data.workflowName,
      type: 'email_notification',
      metadata: {
        eventType: 'workflow_success',
        timestamp: new Date().toISOString(),
      },
    });

    await this.emailService.sendWorkflowSuccess(data);
    return { message: 'Success email sent' };
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-Admin')
  @Post('send-error')
  @TrackMetric({
    name: 'email_workflow_error',
    eventType: 'email_sent',
  })
  @ApiOperation({
    summary: 'Send workflow error notification',
    description: 'Sends an email notification for workflow failures',
  })
  async sendWorkflowError(
    @Body() data: EmailDto,
  ): Promise<{ message: string }> {
    this.logger.info('Received workflow error notification', {
      workflowName: data.workflowName,
      type: 'email_notification',
      metadata: {
        eventType: 'workflow_error',
        timestamp: new Date().toISOString(),
      },
    });

    await this.emailService.sendWorkflowError(data);
    return { message: 'Error email sent' };
  }
}
