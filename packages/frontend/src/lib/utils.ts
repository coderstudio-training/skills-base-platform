import { cacheConfig, errorMessages } from '@/lib/api/config';
import { ApiError, FetchOptions } from '@/lib/api/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export const handleApiError = (error: ApiError): { statusCode: number; message: string } => {
  let message = 'An unexpected error occurred.';
  switch (error.code) {
    case 'NETWORK_ERROR':
      message = errorMessages.NETWORK_ERROR;
      break;
    case 'TIMEOUT_ERROR':
      message = errorMessages.TIMEOUT_ERROR;
      break;
    case 'UNAUTHORIZED':
      message = errorMessages.UNAUTHORIZED;
      break;
    case 'FORBIDDEN':
      message = errorMessages.FORBIDDEN;
      break;
    case 'NOT_FOUND':
      message = errorMessages.NOT_FOUND;
      break;
    case 'SERVER_ERROR':
      message = errorMessages.SERVER_ERROR;
      break;
    case 'INVALID_CREDENTIALS':
      message = errorMessages.INVALID_CREDENTIALS;
      break;
    case 'GOOGLE_AUTH_ERROR':
      message = errorMessages.GOOGLE_AUTH_ERROR;
      break;
    case 'NOT_EMPLOYED':
      message = errorMessages.NOT_EMPLOYED;
      break;
    case 'VALIDATION_ERROR':
      message = errorMessages.VALIDATION_ERROR;
      break;
    case 'STREAM_ERROR':
      message = errorMessages.STREAM_ERROR;
      break;
  }

  return { statusCode: error.status, message };
};

export function validateTextData(text: string): boolean {
  const regex = /^(n\/a|)$/i; // This regex matches "N/A" (case-insensitive) or an empty string

  return regex.test(text) || text.trim().length === 0;
}
