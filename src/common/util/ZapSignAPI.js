import { API_CONFIG, buildZapSignUrl } from '../../config/apiConfig';

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
    const url = buildZapSignUrl(endpoint);

    // Prepare headers
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };

    // Only add Authorization header if token is available (not in development proxy mode)
    if (API_CONFIG.ZAPSIGN_TOKEN) {
      headers.Authorization = `Bearer ${API_CONFIG.ZAPSIGN_TOKEN}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
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

class ZapSignAPI {
  /**
   * Create document via template
   * @param {Object} params - Parameters for document creation
   * @param {boolean} params.sendEmail - Whether to send automatic email
   * @param {boolean} params.sendWhatsapp - Whether to send automatic WhatsApp
   * @param {string} params.signerName - Name of the signer
   * @param {string} params.signerEmail - Email of the signer
   * @param {string} params.signerPhoneCountry - Phone country code
   * @param {string} params.signerPhoneNumber - Phone number
   * @param {string} params.brandLogo - Brand logo URL
   * @param {string} params.folderPath - Folder path for the document
   * @param {Array} params.data - Template data for replacement
   * @param {string} params.templateId - Template ID (optional, defaults to configured one)
   */
  static async createDocViaTemplate({
    sendEmail = false,
    sendWhatsapp = false,
    signerName,
    signerEmail,
    signerPhoneCountry = '55',
    signerPhoneNumber,
    brandLogo = 'https://coragemrastro.top/assets/coragem-logo-XnN66kJy.png',
    folderPath = 'Contratos',
    data = [],
    templateId = '03c08f66-7963-4f86-9b68-c8e137e9d8d1',
    ...otherFields
  }) {
    const payload = {
      template_id: templateId,
      signer_name: signerName,
      signer_email: signerEmail,
      signer_phone_country: signerPhoneCountry,
      signer_phone_number: signerPhoneNumber,
      brand_logo: brandLogo,
      folder_path: folderPath,
      send_automatic_email: sendEmail,
      send_automatic_whatsapp: sendWhatsapp,
      data,
      ...otherFields,
    };

    const response = await fetchWithConfig('models/create-doc/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  }

  /**
   * Add signer to an existing document
   * @param {string} documentId - The UUID of the document
   * @param {Object} signerData - Signer information
   * @param {string} signerData.name - Name of the signer
   * @param {string} signerData.email - Email of the signer
   * @param {string} signerData.phoneCountry - Phone country code (default: "55")
   * @param {string} signerData.phoneNumber - Phone number
   * @param {boolean} signerData.sendAutomaticEmail - Whether to send automatic email (default: true)
   * @param {boolean} signerData.sendAutomaticWhatsapp - Whether to send automatic WhatsApp (default: false)
   */
  static async addSigner(documentId, {
    name,
    email,
    phoneCountry = '55',
    phoneNumber,
    sendAutomaticEmail = true,
    sendAutomaticWhatsapp = false,
  }) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const payload = {
      name,
      email,
      phone_country: phoneCountry,
      phone_number: phoneNumber,
      send_automatic_email: sendAutomaticEmail,
      send_automatic_whatsapp: sendAutomaticWhatsapp,
    };

    const response = await fetchWithConfig(`docs/${documentId}/add-signer/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
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

export default ZapSignAPI;
