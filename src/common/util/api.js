import { buildApiUrl } from '../../config/apiConfig';

/**
 * Enhanced fetch wrapper that automatically uses the correct API URL
 * for both development (proxy) and production (direct) environments
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * GET request helper
 */
export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' });

/**
 * POST request helper
 */
export const apiPost = (endpoint, data) => apiRequest(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
});

/**
 * PUT request helper
 */
export const apiPut = (endpoint, data) => apiRequest(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data),
});

/**
 * DELETE request helper
 */
export const apiDelete = (endpoint, data) => apiRequest(endpoint, {
  method: 'DELETE',
  body: data ? JSON.stringify(data) : undefined,
});

export default { apiRequest, apiGet, apiPost, apiPut, apiDelete };
