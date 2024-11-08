export const API_CONFIG = {
  microservices: {
    user: { baseUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001' },
    skills: { baseUrl: process.env.SKILLS_SERVICE_URL || 'http://localhost:3002' },
    learning: { baseUrl: process.env.LEARNING_SERVICE_URL || 'http://localhost:3003' },
    eventProcess: { baseUrl: process.env.EVENT_PROCESS_SERVICE_URL || 'http://localhost:3005' },
    email: { baseUrl: process.env.EMAIL_SERVICE_URL || 'http://localhost:3006' },
  },
  version: 'v1',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};
