import { HttpMethods } from '../types/index';
import { ApiConfig } from './apiConfig';

export interface RequestConfig<T> {
  service: keyof (typeof ApiConfig)['microservices'];
  endpoint: string;
  method: HttpMethods;
  body?: T;
  headers?: Record<string, string>;
  query?: string;
  cache?: RequestCache;
}
