export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  totalCount: number;
  pageSize: number;
  currentPage: number;
}
