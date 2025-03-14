// Production-ready API proxy implementation
import { createProxyMiddleware } from 'http-proxy-middleware';

// Create proxy configuration - modify target as needed
const apiProxy = createProxyMiddleware({
  target: 'http://coragemserver.top',
  changeOrigin: true,
  ws: true, // Enable WebSocket support
  pathRewrite: undefined, // Keep the original path (don't rewrite)
  secure: false, // Don't verify SSL certificates

  // Ensure query parameters are properly forwarded - important for token auth
  ignorePath: false,
  followRedirects: true,

  // Log proxy activity - customize as needed
  logLevel: process.env.NODE_ENV === 'production' ? 'silent' : 'warn',

  // Add optional CORS headers to responses
  onProxyRes: (proxyRes, req) => {
    // Add CORS headers
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept';

    // Optional logging in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
    }
  },

  // Handle WebSocket connections
  onProxyReqWs: (proxyReq, req) => {
    console.log(`[WebSocket] Proxying WebSocket connection: ${req.url}`);

    // Ensure the token is preserved when upgrading the connection
    const token = req.url.includes('token=') ? req.url.split('token=')[1].split('&')[0] : null;
    if (token) {
      console.log('[WebSocket] Forwarding with token authentication');
    }
  },

  // Handle WebSocket proxy errors
  onError: (err, req, res) => {
    console.error('[Proxy Error]', err);
    if (!res.headersSent && res.writeHead) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }));
    }
  },

  // Optionally modify request headers before sending to target
  onProxyReq: (proxyReq, req) => {
    // Add custom headers if needed
    proxyReq.setHeader('X-Forwarded-By', 'Vercel Proxy');

    // Preserve the URL query parameters in the outgoing request
    const url = new URL(req.url, 'http://localhost');
    if (url.search) {
      console.log(`[Proxy] Forwarding request with query parameters: ${url.search}`);
    }
  },
});

// Tell Next.js this is an API route that:
// 1. Is handled by an external resolver (http-proxy-middleware)
// 2. Should not parse the body (to preserve raw request body for the proxy)
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

/**
 * API Route handler function - processes all requests under /api/*
 */
export default function handler(req, res) {
  // Special handling for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight
    res.status(200).end();
    return;
  }

  // Log the incoming URL to help with debugging
  console.log(`[Request] ${req.method} ${req.url}`);

  // Process the request with our proxy middleware
  apiProxy(req, res, (err) => {
    // This function is called when the proxy middleware doesn't handle the request
    // This could be due to an error or because the middleware didn't match the request
    if (err) {
      console.error('Proxy middleware error:', err);
      res.status(500).json({ error: 'Proxy Error', message: err.message });
      return;
    }

    // If we get here, something went wrong with the proxy
    res.status(404).json({
      error: 'Not Found',
      message: `Request '${req.url}' could not be proxied to the target server.`,
    });
  });
}
