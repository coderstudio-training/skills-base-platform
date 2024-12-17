import { ApiProperty } from '@nestjs/swagger';

export class GrafanaWebhookAlert {
  @ApiProperty({
    description: 'URL to the Grafana dashboard',
    example: 'http://grafana.example.com/d/abc123',
  })
  dashboardURL: string;

  @ApiProperty({
    description: 'URL to silence the alert',
    example: 'http://grafana.example.com/alerting/silence/create',
  })
  silenceURL: any;

  @ApiProperty({
    description: 'Current status of the alert',
    example: 'firing',
  })
  status: string;

  @ApiProperty({
    description: 'Alert labels containing metadata',
    example: {
      alertname: 'HighCPUUsage',
      instance: 'server-01',
    },
  })
  labels: {
    alertname: string;
    instance: string;
    [key: string]: string;
  };

  @ApiProperty({
    description: 'Alert annotations with additional details',
    example: {
      summary: 'High CPU usage detected',
      description: 'CPU usage is above 90% for the last 5 minutes',
    },
  })
  annotations: {
    summary?: string;
    description?: string;
    [key: string]: string | undefined;
  };

  @ApiProperty({
    description: 'Timestamp when the alert started',
    example: '2024-12-13T06:55:22Z',
  })
  startsAt: string;

  @ApiProperty({
    description: 'String representation of the alert value',
    example: '95.5%',
    required: false,
  })
  valueString?: string;
}

export class GrafanaWebhookPayload {
  @ApiProperty({
    description: 'Name of the alert receiver',
    example: 'email-team',
  })
  receiver: string;

  @ApiProperty({
    description: 'Overall status of the alert group',
    example: 'firing',
  })
  status: string;

  @ApiProperty({
    description: 'Array of individual alerts',
    type: [GrafanaWebhookAlert],
  })
  alerts: GrafanaWebhookAlert[];

  @ApiProperty({
    description: 'Labels shared by all alerts in the group',
    example: { severity: 'critical' },
  })
  groupLabels: Record<string, string>;

  @ApiProperty({
    description: 'Common labels across all alerts',
    example: { cluster: 'production' },
  })
  commonLabels: Record<string, string>;

  @ApiProperty({
    description: 'Common annotations across all alerts',
    example: { team: 'platform' },
  })
  commonAnnotations: Record<string, string>;

  @ApiProperty({
    description: 'External URL to the Grafana instance',
    example: 'http://grafana.example.com',
  })
  externalURL: string;

  @ApiProperty({
    description: 'Version of the alert',
    example: '4',
  })
  version: string;

  @ApiProperty({
    description: 'Unique identifier for the alert group',
    example: '{}:{alertname="HighCPUUsage"}',
  })
  groupKey: string;

  @ApiProperty({
    description: 'Alert title',
    example: 'High CPU Usage Alert',
  })
  title: string;

  @ApiProperty({
    description: 'Current state of the alert',
    example: 'firing',
  })
  state: string;

  @ApiProperty({
    description: 'Alert message',
    example: 'CPU usage is above threshold',
  })
  message: string;
}
