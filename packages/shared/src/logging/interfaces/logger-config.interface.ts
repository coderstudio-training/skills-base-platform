export interface LoggerConfig {
  service: string;
  level?: string;
  format?: string;
  transports?: {
    console?: boolean;
    file?: {
      enabled: boolean;
      filename?: string;
      maxFiles?: number;
      maxSize?: string;
    };
    elastic?: {
      enabled: boolean;
      node?: string;
      index?: string;
    };
  };
}
