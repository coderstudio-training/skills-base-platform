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

// DTO from microservices
export interface Taxonomy {
  docId: string;
  docRevisionId: string;
  docTitle: string;
  title: string;
  category: string;
  description: string;
  proficiencyDescription: Record<string, any>;
  abilities: Record<string, any>;
  knowledge: Record<string, any>;
  rangeOfApplication?: string[];
}
