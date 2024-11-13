export interface MetricLabels extends Record<string, string | number> {
  service: string;
}
export interface MonitoringOptions {
  serviceName: string;
  enabled?: boolean;
  sampleRate?: number;
  customBuckets?: {
    http?: number[];
    operation?: number[];
  };
  tags?: Record<string, string>;
}
