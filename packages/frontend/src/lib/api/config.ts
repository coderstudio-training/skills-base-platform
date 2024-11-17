import { ApiConfig, RolePermissions } from './types';

const timeout = 10000;
const version = 'v1';
const default_headers = {
  'Content-Type': 'application/json',
};

export const serviceConfigs: Record<string, ApiConfig> = {
  users: {
    baseUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    timeout: timeout,
    version: version,
    defaultHeaders: default_headers,
  },
  skills: {
    baseUrl: process.env.SKILLS_SERVICE_URL || 'http://localhost:3002',
    timeout: timeout,
    version: version,
    defaultHeaders: default_headers,
  },
  learning: {
    baseUrl: process.env.LEARNING_SERVICE_URL || 'http://localhost:3003',
    timeout: timeout,
    version: version,
    defaultHeaders: default_headers,
  },
};

// Next.js Cache config
export const cacheConfig = {
  defaultRevalidate: 3600, // 1 hour
  defaultStaleWhileRevalidate: 7200, // 2 hours, used for Cache control header
};

// Next.js 14 Server Actions Configuration
export const serverActionsConfig = {
  revalidation: {
    default: true,
    paths: {
      dashboard: '/dashboard',
      skills: '/skills',
      learning: '/learning',
      team: '/team',
      reports: '/reports',
    },
  },
  errorHandling: {
    retryCount: 3,
    retryDelay: 1000,
  },
};

export const errorMessages = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  FORBIDDEN: "Access forbidden. You don't have permission to access this resource.",
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error occurred.',
  INVALID_CREDENTIALS: 'Invalid username or password.',
  GOOGLE_AUTH_ERROR: 'Google authentication failed.',
  NOT_EMPLOYED: 'User is not registered as an employee.',
  VALIDATION_ERROR: 'Validation error occurred.',
  STREAM_ERROR: 'Error in data stream.',
};

export const rolePermissions: RolePermissions = {
  staff: {
    canViewDashboard: true,
    canViewSkills: true,
    canEditOwnSkills: true,
    canViewLearning: true,
    canEditOwnLearning: true,
  },
  manager: {
    canViewDashboard: true,
    canViewSkills: true,
    canEditOwnSkills: true,
    canEditTeamSkills: true,
    canViewLearning: true,
    canEditOwnLearning: true,
    canEditTeamLearning: true,
    canViewReports: true,
    canManageTeam: true,
  },
  admin: {
    canViewDashboard: true,
    canViewSkills: true,
    canEditOwnSkills: true,
    canEditAllSkills: true,
    canViewLearning: true,
    canEditOwnLearning: true,
    canEditAllLearning: true,
    canViewReports: true,
    canManageTeam: true,
    canManageSystem: true,
    canManageUsers: true,
  },
};

// to be updated
export const authConfig = {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  endpoints: {
    googleAuth: '/auth/google',
    login: '/auth/login',
    register: 'auth/register',
    logout: '/auth/logout',
  },
  // Role-based routes configuration
  routes: {
    staff: ['/dashboard', '/skills', '/learning'],
    manager: ['/dashboard', '/skills', '/learning', '/team', '/reports'],
    admin: ['/admin', '/dashboard', '/skills', '/learning', '/team', '/reports', '/settings'],
  },
};

export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
};
