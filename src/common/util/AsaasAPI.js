const BASE_URL = 'https://api-sandbox.asaas.com';
const ACCESS_TOKEN = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmFjZTU1MTFjLWU1OTItNGZiYy05MGYwLTlhNGM2ZGU2ZDNhMDo6JGFhY2hfZTQyODE5MjEtNjljZi00YTAwLWIxNjgtZGQxNzk1ZTU1Nzky';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

class AsaasAPI {
  static async getSubscriptions(offset = 0, limit = 50) {
    try {
      const response = await fetch(`${BASE_URL}/v3/subscriptions?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          access_token: ACCESS_TOKEN,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  static async getSubscription(id) {
    try {
      const response = await fetch(`${BASE_URL}/v3/subscriptions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          access_token: ACCESS_TOKEN,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      throw error;
    }
  }

  static async createSubscription(subscriptionData) {
    try {
      const response = await fetch(`${BASE_URL}/v3/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: ACCESS_TOKEN,
        },
        body: JSON.stringify(subscriptionData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(id, subscriptionData) {
    try {
      const response = await fetch(`${BASE_URL}/v3/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          access_token: ACCESS_TOKEN,
        },
        body: JSON.stringify(subscriptionData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      throw error;
    }
  }

  static async deleteSubscription(id) {
    try {
      const response = await fetch(`${BASE_URL}/v3/subscriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          access_token: ACCESS_TOKEN,
        },
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      throw error;
    }
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
