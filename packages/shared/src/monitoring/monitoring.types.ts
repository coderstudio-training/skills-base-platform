// Base configuration interfaces with optional properties
export interface MetricLabels extends Record<string, string | number> {
  service: string;
}

export interface HttpMetricsConfig {
  enabled?: boolean;
  buckets?: number[];
  excludePaths?: string[];
}

export interface SystemMetricsConfig {
  enabled?: boolean;
  collectInterval?: number;
}

export interface BusinessMetricsConfig {
  enabled?: boolean;
}

export interface MetricsConfig {
  http?: Partial<HttpMetricsConfig>;
  system?: Partial<SystemMetricsConfig>;
  business?: Partial<BusinessMetricsConfig>;
}

export interface MonitoringConfig {
  serviceName?: string;
  enabled?: boolean;
  sampleRate?: number;
  metrics?: Partial<MetricsConfig>;
  tags?: Record<string, string>;
}

// Complete config type for internal use
export interface CompleteMonitoringConfig {
  serviceName: string;
  enabled: boolean;
  sampleRate: number;
  metrics: {
    http: Required<HttpMetricsConfig>;
    system: Required<SystemMetricsConfig>;
    business: Required<BusinessMetricsConfig>;
  };
  tags: Record<string, string>;
}
