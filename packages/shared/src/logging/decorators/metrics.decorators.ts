import { SetMetadata } from '@nestjs/common';

export const METRIC_KEY = 'metric_key';

export interface MetricOptions {
  name: string;
  help?: string;
  labelNames?: string[];
}

export function TrackMetric(options: MetricOptions) {
  return SetMetadata(METRIC_KEY, options);
}
