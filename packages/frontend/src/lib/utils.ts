import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiError, FetchOptions } from '../lib/api/types';
import { cacheConfig, errorMessages } from './api/config';

type LogArgs = string | number | boolean | null | undefined | Error | object | unknown;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const logger = {
  log: (...args: LogArgs[]): void => console.log('[NextAuth]', ...args),
  error: (...args: LogArgs[]): void => console.error('[NextAuth Error]', ...args),
  warn: (...args: LogArgs[]): void => console.warn('[NextAuth Warning]', ...args),
  debug: (...args: LogArgs[]): void => console.debug('[NextAuth Debug]', ...args),
};

export const buildFetchOptions = (options?: FetchOptions): FetchOptions => {
  // If both cache and revalidate are provided, we need to handle this conflict
  if (options?.cache && options?.revalidate) {
    throw new Error("Only one of 'cache' or 'revalidate' can be specified.");
  }

  // Default to 'default' cache policy if no cache option is provided
  const cache = options?.cache || null;

  // Default to revalidation period if not provided
  const revalidate = options?.revalidate || cacheConfig.defaultRevalidate;

  // If cache is set to force-cache, we don't need revalidation
  if (cache === 'force-cache') {
    return {
      cache: 'force-cache',
      headers: {
        ...options?.headers,
      },
      requiresAuth: options?.requiresAuth ?? false,
    };
  }

  // Otherwise, we use revalidation and no cache policy.
  return {
    cache, // will be 'default' or any other value passed
    revalidate, // ensures revalidation is used when cache is not 'force-cache'
    headers: {
      ...options?.headers,
    },
    requiresAuth: options?.requiresAuth ?? false,
  };
};

export function formatError(error: ApiError): string {
  return `[${error.status}] - ${error.message} : ${error.code}`;
}

export const handleApiError = (error: ApiError): string => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return errorMessages.NETWORK_ERROR;
    case 'TIMEOUT_ERROR':
      return errorMessages.TIMEOUT_ERROR;
    case 'UNAUTHORIZED':
      return errorMessages.UNAUTHORIZED;
    case 'FORBIDDEN':
      return errorMessages.FORBIDDEN;
    case 'NOT_FOUND':
      return errorMessages.NOT_FOUND;
    case 'SERVER_ERROR':
      return errorMessages.SERVER_ERROR;
    case 'INVALID_CREDENTIALS':
      return errorMessages.INVALID_CREDENTIALS;
    case 'GOOGLE_AUTH_ERROR':
      return errorMessages.GOOGLE_AUTH_ERROR;
    case 'NOT_EMPLOYED':
      return errorMessages.NOT_EMPLOYED;
    case 'VALIDATION_ERROR':
      return errorMessages.VALIDATION_ERROR;
    case 'STREAM_ERROR':
      return errorMessages.STREAM_ERROR;
    default:
      return 'An unexpected error occurred.';
  }
};
