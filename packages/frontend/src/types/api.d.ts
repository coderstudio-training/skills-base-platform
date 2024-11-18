export interface PaginatedEmployeeResponse extends ApiResponse<Employee[]> {
  items: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SyncStatus {
  success: boolean;
  message: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
}

export interface DataSourceType {
  'Self-Assessment': string;
  'Manager Assessment': string;
  'Staff List': string;
  Courses: string;
  'Learning Paths': string;
  'Skills Matrix': string;
  'Skills Taxonomy': string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  departmentId: string;
  // Add other fields as necessary
}

interface PerformanceMetricsResponse {
  metrics: PerformanceMetric[];
  total: number;
  // Add other response properties if necessary
}

interface DevelopmentPlan {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Add other fields based on the API response
}

interface DevelopmentPlansResponse {
  plans: DevelopmentPlan[];
  total: number;
  // Other possible metadata in the response
}
