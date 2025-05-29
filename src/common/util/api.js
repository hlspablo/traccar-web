import { buildApiUrl } from '../../config/apiConfig';

/**
 * Enhanced fetch wrapper that automatically uses the correct API URL
 * for both development (proxy) and production (direct) environments
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = buildApiUrl(endpoint);

    // console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    // console.log('🍪 Current cookies:', document.cookie);

    // Prepare headers - don't set Content-Type for GET requests
    const headers = { ...options.headers };
    if (options.method !== 'GET' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      credentials: 'include', // Always include cookies for session authentication
      ...options,
      headers,
    });

    // console.log(`📡 Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);

      // Special handling for session-related errors
      if (response.status === 401 && endpoint.includes('/session')) {
        // console.log('🔓 Session expired or invalid - cookies will be cleared on next login');
      }

      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return [];
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // For non-JSON responses that are not 204, try to get text content
    const text = await response.text();
    return text || null;
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
export const apiDelete = (endpoint, data = null) => apiRequest(endpoint, {
  method: 'DELETE',
  body: data ? JSON.stringify(data) : undefined,
});

export default { apiRequest, apiGet, apiPost, apiPut, apiDelete };
