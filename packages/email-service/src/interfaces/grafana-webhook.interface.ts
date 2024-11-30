export interface GrafanaWebhookAlert {
  dashboardURL: string;
  silenceURL: any;
  status: string;
  labels: {
    alertname: string;
    instance: string;
    [key: string]: string;
  };
  annotations: {
    summary?: string;
    description?: string;
    [key: string]: string | undefined;
  };
  startsAt: string;
  valueString?: string;
}

export interface GrafanaWebhookPayload {
  receiver: string;
  status: string;
  alerts: GrafanaWebhookAlert[];
  groupLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  commonAnnotations: Record<string, string>;
  externalURL: string;
  version: string;
  groupKey: string;
  title: string;
  state: string;
  message: string;
}
