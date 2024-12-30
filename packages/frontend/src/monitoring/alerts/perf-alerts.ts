export const PERFORMANCE_ALERTS = {
  slowResponses: {
    name: 'Slow API Responses',
    query:
      'avg by (path) (rate({app="frontend"} | json | type=~"api.*.response" | unwrap duration [5m])) > 1000',
    for: '5m',
    labels: {
      severity: 'warning',
      team: 'frontend',
    },
    annotations: {
      summary: 'Slow API responses detected',
      description: 'API response time exceeds 1000ms',
    },
  },
  highMemory: {
    name: 'High Memory Usage',
    query:
      'max(rate({app="frontend"} | json | type="system.warning" | unwrap performance_memory [5m])) > 1073741824',
    for: '5m',
    labels: {
      severity: 'warning',
      team: 'frontend',
    },
    annotations: {
      summary: 'High memory usage detected',
      description: 'Memory usage exceeds 1GB',
    },
  },
};
