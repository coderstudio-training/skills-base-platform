export const ERROR_ALERTS = {
  highErrorRate: {
    name: 'High Error Rate',
    query: 'sum(rate({app="frontend"} | json | severity="ERROR" [5m])) > 0.1',
    for: '5m',
    labels: {
      severity: 'critical',
      team: 'frontend',
    },
    annotations: {
      summary: 'High error rate detected',
      description: 'Frontend error rate exceeds threshold of 10%',
    },
  },
  authFailures: {
    name: 'Authentication Failures',
    query: 'sum(rate({app="frontend"} | json | type="auth.login.error" [5m])) > 0.05',
    for: '5m',
    labels: {
      severity: 'critical',
      team: 'frontend',
    },
    annotations: {
      summary: 'High authentication failure rate',
      description: 'Authentication failures exceed threshold of 5%',
    },
  },
};
