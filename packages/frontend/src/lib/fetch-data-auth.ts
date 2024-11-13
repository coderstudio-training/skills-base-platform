// Importing necessary modules for authentication, Next.js server-side session, and fetch helper function.
import { authOptions } from '@/lib/api/auth';
import { getServerSession } from 'next-auth/next';
import { FetchApiResponse } from '../types';
import fetcher from './fetch-data';
import { RequestConfig } from './requestConfig';

/**
 * Fetch function with authentication, retrieves data from APIs with a required access token.
 *
 * @template T - Expected type of the response data.
 * @param {RequestConfig<T>} config - API request configuration (service, endpoint, method, etc.).
 * @param {string} [token_string] - Optional token to use for authorization; defaults to session or localStorage token.
 *
 * @returns {Promise<FetchApiResponse<T>>} - Returns a promise with either the response data or an error.
 */
export async function fetcherAuth<T>(
  config: RequestConfig<T>,
  token_string?: string,
): Promise<FetchApiResponse<T>> {
  // Attempt to retrieve the token from provided token_string, localStorage, or null if undefined
  let token = (token_string || localStorage.getItem('accessToken')) ?? null;

  // If running on the server and no token is available, fetch the session token server-side
  if (!token && typeof window === 'undefined') {
    const session = await getServerSession(authOptions);
    token = session?.user?.accessToken ?? null;
  }

  // Return an error if no token is found, as this indicates authentication failure
  if (!token) {
    return {
      data: null,
      error: { message: 'Missing token!', code: 'AUTH_ERROR', status: 401 },
      status: 401,
    };
  }

  // Append the token to headers for authentication
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Call the generic fetcher function with the config, including the authorization headers
  return fetcher({ ...config, headers: { ...config.headers, ...authHeaders } });
}
