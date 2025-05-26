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

  // Asaas API
  ASAAS_BASE_URL: isDevelopment
    ? '/asaas-proxy' // Use proxy in development
    : 'https://api-sandbox.asaas.com', // Direct URL in production

  // Asaas Access Token
  ASAAS_ACCESS_TOKEN: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmFjZTU1MTFjLWU1OTItNGZiYy05MGYwLTlhNGM2ZGU2ZDNhMDo6JGFhY2hfZTQyODE5MjEtNjljZi00YTAwLWIxNjgtZGQxNzk1ZTU1Nzky',
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

// Helper function to build Asaas API URL
export const buildAsaasUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.ASAAS_BASE_URL}/${cleanEndpoint}`;
};

export default API_CONFIG;
