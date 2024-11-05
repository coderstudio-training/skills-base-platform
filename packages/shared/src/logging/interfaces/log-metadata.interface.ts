export interface LogMetadata {
  context?: string;
  correlationId?: string;
  userId?: string;
  [key: string]: any;
}
