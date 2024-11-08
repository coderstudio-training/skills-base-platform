export interface FetchApiResponse<T> {
  data: T;
  error: ApiError | null;
  status: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface FetchOptions {
  cache?: 'no-store' | 'force-cache';
  tags?: string[];
  revalidate?: number;
}
