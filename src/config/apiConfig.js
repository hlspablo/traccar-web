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

  // import from .env
  ASAAS_ACCESS_TOKEN: import.meta.env.VITE_ASAAS_ACCESS_TOKEN, // Not needed in frontend when using proxy

  // ZapSign API
  ZAPSIGN_BASE_URL: isDevelopment
    ? '/zapsign-proxy' // Use Vite proxy in development
    : 'https://assass-proxy.onrender.com', // Direct URL in production

  // import from .env
  ZAPSIGN_TOKEN: import.meta.env.VITE_ZAPSIGN_TOKEN, // Not needed in frontend when using proxy
};

console.log(API_CONFIG.ASAAS_ACCESS_TOKEN);
console.log(API_CONFIG.ZAPSIGN_TOKEN);

console.log('isDevelopment', isDevelopment);

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
