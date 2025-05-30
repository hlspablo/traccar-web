// API Configuration for different environments
const isDevelopment = import.meta.env.DEV;

// Base URLs for APIs
export const API_CONFIG = {
  // Main API (Traccar server)
  BASE_URL: isDevelopment
    ? '/api' // Use proxy in development
    : 'https://coragemserver.top/api', // Direct URL in production

  // WebSocket URL
  WEBSOCKET_URL: isDevelopment
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/socket`
    : 'wss://coragemserver.top/api/socket',

  // Asaas API - Use proxy service to avoid CORS issues
  ASAAS_BASE_URL: isDevelopment
    ? '/asaas-proxy' // Use Vite proxy in development
    : 'https://assass-proxy.onrender.com', // Replace with your actual deployed proxy URL

  // Asaas Access Token (handled by proxy service for security)
  ASAAS_ACCESS_TOKEN: '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmE5OTBmMTNiLWQ1OWQtNGE3My1iNzk2LWMyODEyNmUwNTE1ZTo6JGFhY2hfYTBhNjc1MmQtMWQ4Ny00OWJiLTg3M2QtZmY3MDBkYzA1Yjc0', // Not needed in frontend when using proxy

  // ZapSign API
  ZAPSIGN_BASE_URL: isDevelopment
    ? '/zapsign-proxy' // Use Vite proxy in development
    : 'https://sandbox.api.zapsign.com.br/api/v1', // Direct URL in production
  ZAPSIGN_TOKEN: isDevelopment
    ? null // Token handled by proxy in development
    : '60f10aa5-26e5-4e5a-8021-c5ccb5e8f914ebe0d3b2-efa7-4589-96f9-ad0408384cce', // Token for production
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

// Helper function to build Asaas API URL (through proxy service)
export const buildAsaasUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.ASAAS_BASE_URL}/${cleanEndpoint}`;
};

// Helper function to build ZapSign API URL
export const buildZapSignUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.ZAPSIGN_BASE_URL}/${cleanEndpoint}`;
};

export default API_CONFIG;
