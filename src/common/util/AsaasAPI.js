import { API_CONFIG, buildAsaasUrl } from '../../config/apiConfig';

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Unknown error' };
    }
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  try {
    const data = await response.json();
    return data;
  } catch (e) {
    throw new Error('Failed to parse API response', e);
  }
};

// Helper function for making fetch requests
const fetchWithConfig = async (endpoint, options = {}) => {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    // Build the full URL using the configuration
    const url = buildAsaasUrl(endpoint);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        access_token: API_CONFIG.ASAAS_ACCESS_TOKEN,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - API call took too long to respond');
    }
    throw error;
  }
};

class AsaasAPI {
  static async getSubscriptions(offset = 0, limit = 10) {
    const response = await fetchWithConfig(`/v3/subscriptions?offset=${offset}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await handleResponse(response);
    return {
      data: data.data || [],
      hasMore: data.hasMore || false,
      totalCount: data.totalCount || 0,
      limit: data.limit || limit,
      offset: data.offset || offset,
    };
  }

  // Helper method to handle API errors and provide error messages
  static handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code outside the 2xx range
      return error.response.data.message || 'API Error';
    } if (error.request) {
      // The request was made but no response was received
      return 'No response from server';
    }
    // Something happened in setting up the request
    return error.message || 'Unknown error';
  }
}

export default AsaasAPI;
