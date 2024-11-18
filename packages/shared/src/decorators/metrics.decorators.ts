import { SetMetadata } from '@nestjs/common';

export const METRIC_KEY = 'metric_key';

export interface MetricOptions {
  name?: string;
  eventType?: string;
  labels?: Record<string, string>;
}

export const TrackMetric = (options: MetricOptions) =>
  SetMetadata(METRIC_KEY, options);
