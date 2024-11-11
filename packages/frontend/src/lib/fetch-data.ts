// Importing custom types and configurations for API requests.
import { FetchApiResponse, FetchOptions } from '../types';
import { ApiConfig } from './apiConfig';
import { RequestConfig } from './requestConfig';

/**
 * Generic fetch function to make API calls with customizable options.
 *
 * @template T - Expected type of the response data.
 * @param {RequestConfig<T>} config - Configuration for the request, including:
 *        - `service`: The service name from which to make the request.
 *        - `endpoint`: The API endpoint to call.
 *        - `method`: HTTP method (GET, POST, etc.), defaults to 'GET'.
 *        - `body`: Payload for POST/PUT requests.
 *        - `headers`: Optional additional headers.
 *        - `query`: URL query string for additional parameters, default is an empty string.
 *        - `cache`: Cache strategy for the request (default: 'no-store').
 * @param {FetchOptions} fetchOptions - Additional fetch options like cache policy.
 *
 * @returns {Promise<FetchApiResponse<T>>} - Returns a promise with the response data or an error.
 */
async function fetcher<T>(
  {
    service,
    endpoint,
    method = 'GET',
    body,
    headers,
    query = '',
    cache = 'no-store',
  }: RequestConfig<T>,
  fetchOptions?: FetchOptions,
): Promise<FetchApiResponse<T>> {
  // Build the full URL for the API request using the service's base URL, endpoint, and query parameters.
  const url = `${ApiConfig.microservices[service].baseUrl}${endpoint}${query}`;

  try {
    // Make the API request with provided method, headers, body, and cache settings.
    const response = await fetch(url, {
      method,
      headers: {
        ...ApiConfig.defaultHeaders, // Default headers from the ApiConfig
        ...headers, // Merge with any headers passed in config
      },
      body: JSON.stringify(body), // Convert body to JSON
      cache: fetchOptions?.cache || cache, // Override cache if specified in fetchOptions
    });

    // Parse response as JSON
    const data = await response.json();

    // Check if the response status is not OK, return error information
    if (!response.ok) {
      return {
        data: null,
        error: {
          message: data.message || 'Unknown error', // Error message from response or default message
          code: data.code || 'ERROR', // Error code from response or default code
          status: response.status, // HTTP status code
        },
        status: response.status,
      };
    }

    // Return response data if the request was successful
    return { data, error: null, status: response.status };
  } catch (error) {
    // Catch network errors or any issues during fetch
    return {
      data: null,
      error: { message: (error as Error).message, code: 'NETWORK_ERROR', status: 0 },
      status: 0,
    };
  }
}

export default fetcher;
