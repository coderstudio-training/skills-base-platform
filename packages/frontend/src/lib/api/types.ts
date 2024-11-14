// Interface exports
export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status?: number;
}

export interface ApiConfig {
  baseUrl: string;
  version?: string;
  timeout?: number;
  defaultHeaders?: HeadersInit;
}

export interface FetchOptions {
  cache?: RequestCache;
  tags?: string[];
  revalidate?: number;
  headers?: HeadersInit;
  requiresAuth?: boolean;
}

export interface ApiClientOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
  requiresAUth?: boolean;
}

// Assess whether these interfaces are required | Update role if Role[]
export interface AuthTokens {
  accessToken: string;
  roles: Roles[];
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  accessToken: string;
  role: Roles;
}

export interface AuthState {
  user: GoogleUser | null;
  role: Roles[];
  isAuthenticated: boolean;
}

// Type Exports
export type Permission =
  | 'canViewDashboard'
  | 'canViewSkills'
  | 'canEditOwnSkills'
  | 'canEditTeamSkills'
  | 'canEditAllSkills'
  | 'canViewLearning'
  | 'canEditOwnLearning'
  | 'canEditTeamLearning'
  | 'canEditAllLearning'
  | 'canViewReports'
  | 'canManageTeam'
  | 'canManageSystem'
  | 'canManageUsers';

export type RolePermissions = {
  [Role in Roles]: {
    [Perm in Permission]?: boolean;
  };
};
export type Roles = 'staff' | 'manager' | 'admin';
export type HttpMethods = 'GET' | 'POST' | 'PUT' | 'DELETE';
