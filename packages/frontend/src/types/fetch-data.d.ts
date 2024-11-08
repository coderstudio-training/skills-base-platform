export interface FetchApiResponse<T> {
  data: T | null;
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

export type HttpMethods = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
